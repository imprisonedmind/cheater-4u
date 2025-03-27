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
import { calculateSuspiciousScore, parseEvidenceFields } from "@/lib/utils";
import { fetchSupabase } from "@/lib/utils/supabase/helpers/supabase-fetch-helper";
import { CustomReport } from "@/lib/types/report";

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

    // Use return instead of redirect if you want to handle it in the client
    return { profileId };
  } catch (err: any) {
    // If it's a redirect, just log it and return null
    if (err?.digest === "NEXT_REDIRECT") {
      console.error("[submitProfileReportAction] Redirect:", err);
      return null;
    }

    console.error("[submitProfileReportAction]", err);
    throw new Error(err.message ?? "Something went wrong");
  }
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
 * Gets the evidence for a single user
 * return a list of Evidence objects
 * */
export async function getUserEvidence(profileId: string) {
  const query = `evidence?select=*&profile_id=eq.${profileId}`;
  const response = await fetchSupabase({ query });
  if (!response.ok) {
    throw new Error(`Failed to fetch evidence for profile ${profileId}`);
  }
  return (await response.json()) as Evidence[];
}

/**
 * Gets the reports for a single user
 * returns a list of CustomReport's
 * */
export async function getUserReports(profileId: string) {
  const query = `reports?select=*&profile_id=eq.${profileId}`;
  const response = await fetchSupabase({ query });
  if (!response.ok) {
    throw new Error(`Failed to fetch evidence for profile ${profileId}`);
  }
  return (await response.json()) as CustomReport[];
}

/**
 * Enriches a suspect with additional data:
 * - Evidence and report counts.
 * - Steam summary.
 * - Ban status.
 * - Suspicious score.
 */
export async function enrichSuspect(suspect: any): Promise<Suspect> {
  const evidence = await getUserEvidence(suspect.id);
  const reports = await getUserReports(suspect.id);
  const evidence_count = evidence.length;
  const report_count = reports.length;
  const steam_summary = await fetchSteamUserSummary(suspect.steam_id_64);
  const ban_status = await fetchSteamBans(suspect.steam_id_64);

  // Calculate suspicious score using all available data
  const suspicious_score = calculateSuspiciousScore({
    ...suspect,
    evidence_count,
    report_count,
    steam_summary,
    ban_status,
  });

  return {
    ...suspect,
    evidence_count,
    report_count,
    steam_summary,
    ban_status,
    suspicious_score,
  };
}

/**
 * Fetches all the profiles in our DB
 * then enriches them with data from steam
 * */
export async function getSuspects() {
  try {
    const query = `profiles?select=*`;
    const response = await fetchSupabase({ query });
    const suspects = await response.json();

    // Enrich each suspect using the shared utility
    const enrichedSuspects: Suspect[] = await Promise.all(
      suspects.map((suspect: any) => enrichSuspect(suspect)),
    );
    return enrichedSuspects;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches the matches profile from our DB
 * then enriches profile with data from steam
 * */
export async function getSuspect(profileId: String) {
  try {
    // Filter profiles by the given profileId
    const query = `profiles?select=*&id=eq.${profileId}`;
    const response = await fetchSupabase({ query });
    const data = await response.json();

    const suspect: Suspect = await enrichSuspect(data[0]);
    return await suspect;
  } catch (error) {
    throw error;
  }
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
