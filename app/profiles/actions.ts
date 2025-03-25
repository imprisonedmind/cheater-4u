"use server";

import { revalidatePath } from "next/cache";
import { hashIP } from "@/lib/utils/hasIp";
import {
  fetchSteamBans,
  fetchSteamUserSummary,
  getSteamIDsFromProfileUrl,
} from "@/lib/steam/steamApis";
import { createClient } from "@/lib/utils/supabase/server";
import { Suspect } from "@/lib/types/suspect";
import { Evidence } from "@/lib/types/evidence";

/**
 * Single server action that:
 * 1) Upserts the profile.
 * 2) Creates a row in `reports` with hashed IP.
 * 3) Calls `submitEvidenceAction` to store the provided evidence in `evidence` table.
 */
export async function submitProfileReportAction(formData: FormData) {
  try {
    const supabase = await createClient();

    // 1) Basic fields
    const steamUrl = formData.get("steam_url")?.toString() ?? "";
    // (Potentially other top-level fields if needed)

    // 2) Resolve steam IDs
    const { steam_id_64, steam_id_32 } =
      await getSteamIDsFromProfileUrl(steamUrl);

    // 3) Upsert into profiles
    const { data: upsertedProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          steam_id_64,
          steam_id_32,
          steam_url: steamUrl,
        },
        {
          onConflict: "steam_id_64",
          ignoreDuplicates: true,
        },
      )
      .select()
      .single();

    let profileId: string | undefined;
    if (!upsertedProfile && !profileError) {
      // conflict => fetch existing
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("steam_id_64", steam_id_64)
        .single();
      profileId = existingProfile?.id;
    } else {
      if (profileError) throw profileError;
      profileId = upsertedProfile?.id;
    }

    if (!profileId) {
      throw new Error("Could not upsert profile.");
    }

    // 4) Insert into reports (hash IP).
    //    With server actions, we can't easily read real IP, so we do a placeholder:
    const fakeIp = "0.0.0.0";
    const hashedIp = await hashIP(fakeIp);

    const { error: reportError } = await supabase.from("reports").insert({
      profile_id: profileId,
      reporter_ip_hash: hashedIp,
    });
    if (reportError) {
      throw reportError;
    }

    // 5) Insert evidence by calling the standalone action
    //    (We pass `formData` and the IDs we just derived.)
    const evidenceResult = await submitEvidenceAction(formData, {
      profileId,
      steam_id_64,
    });
    if (!evidenceResult.success) {
      throw new Error(evidenceResult.error ?? "Failed to insert evidence");
    }

    // 6) Revalidate path(s) if needed
    revalidatePath("/reports");

    return { success: true };
  } catch (err: any) {
    console.error("submitProfileReportAction error:", err);
    return { error: err.message ?? "Unknown error" };
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
  let query = supabase.from("profiles").select("*");
  if (args?.id) {
    query = query.eq("id", args.id).single();
  }

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
