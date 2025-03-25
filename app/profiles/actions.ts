"use server";

import { revalidatePath } from "next/cache";
import { hashIP } from "@/lib/utils/hasIp";
import {
  fetchSteamBans,
  fetchSteamUserSummary,
  getSteamIDsFromProfileUrl,
  resolveVanityURL,
} from "@/lib/steam/steamApis";
import { createClient } from "@/lib/utils/supabase/server";
import { Suspect } from "@/lib/types/suspect";
import { Evidence } from "@/lib/types/evidence";
import {
  RelatedProfileData,
  RelatedProfileIdentifier,
} from "@/lib/types/related_profiles";
import { redirect } from "next/navigation";

/**
 * Single server action that:
 * 1) Upserts the profile.
 * 2) Creates a row in `reports` with hashed IP.
 * 3) Calls `submitEvidenceAction` to store the provided evidence in `evidence` table.
 */
export async function submitProfileReportAction(formData: FormData) {
  try {
    const supabase = await createClient();

    const steamUrl = formData.get("steam_url")?.toString() ?? "";
    if (!steamUrl) throw new Error("Missing Steam URL");

    // 🚨 This line throws immediately if resolution fails
    const { steam_id_64, steam_id_32 } =
      await getSteamIDsFromProfileUrl(steamUrl);

    // Additional validation: Check if the Steam profile exists and is fetchable
    const steamSummary = await fetchSteamUserSummary(steam_id_64);
    if (!steamSummary) {
      throw new Error("Steam profile not found or is private");
    }

    const { data: upsertedProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          steam_id_64,
          steam_id_32,
          steam_url: `https://steamcommunity.com/profiles/${steam_id_64}`,
        },
        { onConflict: "steam_id_64", ignoreDuplicates: true },
      )
      .select()
      .single();

    let profileId: string | undefined;

    if (!upsertedProfile && !profileError) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("steam_id_64", steam_id_64)
        .single();
      profileId = existingProfile?.id;
    } else {
      if (profileError) throw profileError;
      profileId = upsertedProfile?.id;
    }

    if (!profileId) throw new Error("Could not upsert profile.");

    const fakeIp = "0.0.0.0";
    const hashedIp = await hashIP(fakeIp);

    const { error: reportError } = await supabase.from("reports").insert({
      profile_id: profileId,
      reporter_ip_hash: hashedIp,
    });

    if (reportError) throw reportError;

    const hasEvidence =
      formData.get("evidence_type") ||
      formData.get("evidence_url") ||
      formData.get("comments") ||
      formData.get("leetify_link") ||
      formData.get("video_url");

    if (hasEvidence) {
      const evidenceResult = await submitEvidenceAction(formData, {
        profileId,
        steam_id_64,
      });

      if (!evidenceResult.success) {
        throw new Error(evidenceResult.error ?? "Failed to insert evidence");
      }
    }

    redirect(`/profiles/${profileId}`);
  } catch (err: any) {
    if (err?.digest === "NEXT_REDIRECT") throw err;
    console.error("[submitProfileReportAction]", err);
    throw new Error(err.message ?? "Something went wrong");
  }
}

/**
 * Parse the relevant evidence fields from FormData.
 * You could also parse them inline if you prefer.
 */
function parseEvidenceFields(formData: FormData) {
  const videoUrl = formData.get("video_url")?.toString() ?? "";
  const videoDesc = formData.get("video_description")?.toString() ?? "";
  const screenshotUrl = formData.get("screenshot_url")?.toString() ?? "";
  const screenshotDesc =
    formData.get("screenshot_description")?.toString() ?? "";
  const detailedDesc = formData.get("detailed_description")?.toString() ?? "";
  const game = formData.get("game")?.toString() ?? "";

  let evidenceType = "";
  let evidenceUrl = "";
  let evidenceContent = "";

  if (videoUrl) {
    evidenceType = "video";
    evidenceUrl = videoUrl;
    evidenceContent = videoDesc;
  } else if (screenshotUrl) {
    evidenceType = "screenshot";
    evidenceUrl = screenshotUrl;
    evidenceContent = screenshotDesc;
  } else if (detailedDesc) {
    evidenceType = "description";
    evidenceUrl = "";
    evidenceContent = detailedDesc;
  }

  if (game && evidenceContent) {
    evidenceContent = `Game: ${game}\n${evidenceContent}`;
  }

  return { evidenceType, evidenceUrl, evidenceContent };
}

/**
 * Inserts a new row into the `evidence` table.
 * You can call this from anywhere, as long as you know the `profileId`
 * and the `steam_id_64`.
 */
export async function submitEvidenceAction(
  formData: FormData,
  args: { profileId: string; steam_id_64?: string },
) {
  const supabase = await createClient();

  const { evidenceType, evidenceUrl, evidenceContent } =
    parseEvidenceFields(formData);

  // If the user provided no evidence fields, optionally skip
  if (!evidenceType) {
    return { success: false, message: "No evidence fields provided." };
  }

  const { profileId, steam_id_64 } = args;

  // Insert a new `evidence` row
  const { error } = await supabase.from("evidence").insert({
    profile_id: profileId,
    steam_id_64: steam_id_64 ?? null, // store same 64 ID in evidence if desired
    evidence_type: evidenceType,
    evidence_url: evidenceUrl || null,
    content: evidenceContent || null,
  });

  if (error) {
    console.error("submitEvidenceAction error:", error);
    return { success: false, error: error.message };
  }

  // Optionally revalidate something
  revalidatePath(`/profiles/${profileId}`);

  return { success: true };
}

/**
 * Server Action: fetch one or many "profiles" from DB,
 * then enrich with Steam data, counts, and suspicious logic.
 *
 * If `id` is provided, returns a single suspect object.
 * If `id` is omitted, returns an array of suspects.
 */
export async function fetchEnrichedSuspectsAction(args?: { id?: string }) {
  const supabase = await createClient();

  // 1) Base query from "profiles"
  const query = args?.id
    ? supabase.from("profiles").select("*").eq("id", args.id).single()
    : supabase.from("profiles").select("*");

  const { data: result, error } = await query;
  if (error) {
    console.error("fetchEnrichedSuspectsAction error:", error);
    return { error: error.message };
  }

  // We'll unify single vs. multiple by wrapping single in an array
  const profiles = Array.isArray(result) ? result : [result];

  // 2) Enrich each profile
  const enriched: Suspect[] = [];
  for (const profile of profiles) {
    const suspect: Suspect = {
      id: profile.id,
      steam_id_64: profile.steam_id_64,
      steam_id_32: profile.steam_id_32,
      steam_url: profile.steam_url,
      cheater: Boolean(profile.cheater),
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      related_profiles: profile.related_profiles,
    };

    // a) Count how many rows in "reports" reference this profile
    let report_count = 0;
    {
      const { error: reportErr, count } = await supabase
        .from("reports")
        .select("*", { count: "exact" })
        .eq("profile_id", suspect.id);

      if (reportErr) {
        console.error("Failed to get report_count for", suspect.id, reportErr);
      } else {
        report_count = count ?? 0;
      }
    }

    // b) Count how many rows in "evidence" reference this profile
    let evidence_count = 0;
    {
      const { error: evidenceErr, count } = await supabase
        .from("evidence")
        .select("*", { count: "exact" })
        .eq("profile_id", suspect.id);

      if (evidenceErr) {
        console.error(
          "Failed to get evidence_count for",
          suspect.id,
          evidenceErr,
        );
      } else {
        evidence_count = count ?? 0;
      }
    }

    // c) If steam_id_64 is present, fetch Steam name/avatar/bans
    let steam_name = "Unknown";
    let avatar_url = "/placeholder.svg?height=128&width=128";
    let ban_status = false;

    if (suspect.steam_id_64) {
      // Summaries
      const summary = await fetchSteamUserSummary(suspect.steam_id_64);
      if (summary) {
        steam_name = summary.steam_name;
        avatar_url = summary.avatar_url;
      }
      // Bans
      const bans = await fetchSteamBans(suspect.steam_id_64);
      if (bans?.ban_status) {
        ban_status = true;
      }
    }

    // d) Build the final object
    suspect.steam_name = steam_name;
    suspect.avatar_url = avatar_url;
    suspect.ban_status = ban_status;
    suspect.report_count = report_count;
    suspect.evidence_count = evidence_count;

    // e) Compute suspicious_score
    //    If `cheater` => override to 999
    let suspicious_score = 0;
    if (suspect.cheater) {
      suspicious_score = 999;
    } else {
      // example formula (report_count * 10) limited to 100
      suspicious_score = Math.min(report_count * 10, 100);
      // or incorporate ban_status => suspicious_score += ban_status ? 50 : 0
    }
    suspect.suspicious_score = suspicious_score;

    enriched.push(suspect);
  }

  // Optionally revalidate if you want
  // revalidatePath("/somepath")

  // 3) Return single or array
  if (args?.id) {
    return { data: enriched[0] };
  }
  return { data: enriched };
}

/**
 * Server Action: fetch one or many "evidence" from DB,
 */
export async function fetchEvidenceForProfile(
  profileId: string,
): Promise<Evidence[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evidence")
    .select("*")
    .eq("profile_id", profileId);

  if (error) {
    console.error("Error fetching evidence:", error);
    throw new Error("Failed to fetch evidence for profile");
  }

  return data ?? [];
}

/**
 * Server Action: fetch one or many "reports" from DB for a specific user,
 */
export async function fetchReportsForUser(userId: string): Promise<Report[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("profile_id", userId);

  if (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Failed to fetch reports for user");
  }

  return data ?? [];
}

/**
 * Fetches related profile data for each identifier.
 * - If identifier.profile_id exists, we fetch data from our internal "profiles" table.
 * - Otherwise, if identifier.steam_id_64 exists, we fetch Steam data using our Steam API helper.
 */

export async function fetchRelatedProfilesData(
  relatedProfiles: RelatedProfileIdentifier[],
): Promise<RelatedProfileData[]> {
  const results: RelatedProfileData[] = [];
  const supabase = await createClient();

  for (const identifier of relatedProfiles) {
    if (identifier.profile_id) {
      // Fetch internal profile details from our DB.
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, name")
        .eq("id", identifier.profile_id)
        .single();

      if (error || !data) {
        console.error("Error fetching internal profile data:", error);
        continue;
      }
      results.push({
        avatar_url: data.avatar_url,
        name: data.name,
        link: `/profiles/${identifier.profile_id}`,
      });
    } else if (identifier.steam_id_64) {
      // Fetch Steam summary using the provided 64-bit ID.
      try {
        const summary = await fetchSteamUserSummary(identifier.steam_id_64);
        if (summary) {
          results.push({
            avatar_url: summary.avatar_url,
            name: summary.steam_name,
            link: `https://steamcommunity.com/profiles/${identifier.steam_id_64}`,
          });
        }
      } catch (error) {
        console.error("Error fetching Steam data for steam_id_64:", error);
      }
    } else if (identifier.steam_id) {
      // Resolve vanity (custom) Steam ID then fetch summary.
      try {
        const resolvedSteamId64 = await resolveVanityURL(identifier.steam_id);
        const summary = await fetchSteamUserSummary(resolvedSteamId64);
        if (summary) {
          results.push({
            avatar_url: summary.avatar_url,
            name: summary.steam_name,
            link: `https://steamcommunity.com/profiles/${resolvedSteamId64}`,
          });
        }
      } catch (error) {
        console.error("Error fetching Steam data for vanity ID:", error);
      }
    }
  }
  return results;
}
