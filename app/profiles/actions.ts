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
import { getServerSession } from "@/lib/auth/get-server-session";
import { CommentType } from "@/lib/types/comment";

/**
 * Single server action that:
 * 1) Upserts the profile.
 * 2) Creates a row in `reports` with hashed IP.
 * 3) Calls `submitEvidenceAction` to store the provided evidence in `evidence` table.
 */
export async function submitProfileReportAction(formData: FormData) {
  try {
    const supabase = await createClient();

    const user = await getServerSession(); // You now have access to session
    const reporter_steam_id_64 = user?.steam_id_64;
    if (!reporter_steam_id_64) throw new Error("Unauthorized");

    const steamUrl = formData.get("steam_url")?.toString();
    if (!steamUrl) throw new Error("Missing Steam URL");

    const { steam_id_64, steam_id_32 } =
      await getSteamIDsFromProfileUrl(steamUrl);

    const steamSummary = await fetchSteamUserSummary(steam_id_64);
    if (!steamSummary) throw new Error("Steam profile not found or is private");

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
      .select("id")
      .single();

    if (profileError) throw profileError;

    const profileId = upsertedProfile?.id;
    if (!profileId) throw new Error("Could not upsert or find profile.");

    const fakeIp = "0.0.0.0"; // Replace with real IP if possible
    const reporter_ip_hash = await hashIP(fakeIp);

    const { error: reportError } = await supabase.from("reports").insert({
      profile_id: profileId,
      reporter_ip_hash,
      reporter_steam_id_64,
    });

    if (reportError) throw reportError;

    const hasEvidence = [
      "evidence_type",
      "evidence_url",
      "comments",
      "leetify_link",
      "video_url",
    ].some((field) => formData.get(field));

    if (hasEvidence) {
      const result = await submitEvidenceAction(formData, {
        profileId,
        steam_id_64,
      });
      if (!result.success)
        throw new Error(result.error ?? "Failed to insert evidence");
    }

    return { profileId };
  } catch (err: any) {
    if (err?.digest === "NEXT_REDIRECT") {
      console.error("[submitProfileReportAction] Redirect:", err);
      return null;
    }

    console.error("[submitProfileReportAction]", err);
    throw new Error(err.message ?? "Unexpected server error");
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
 * Gets the comments for a single user
 * */
export async function getUserComments(profileId: string) {
  const query = `
    comments?select=id,created_at,content,up_votes,down_votes,parent_id,author_id(
      id,steam_name,steam_avatar_url
    )&profile_id=eq.${profileId}&order=created_at.asc
  `.replace(/\s+/g, "");

  const res = await fetchSupabase({ query, revalidate: 0, cache: "no-cache" });

  if (!res.ok) {
    console.error("Failed to fetch comments:", await res.text());
    return [];
  }

  const data = await res.json();

  // Group into threads
  const topLevel: CommentType[] = [];
  const map = new Map<number, CommentType>();

  for (const comment of data) {
    const transformed: CommentType = {
      id: comment.id,
      profileId,
      createdAt: comment.created_at ? new Date(comment.created_at) : new Date(),
      content: comment.content,
      likes: comment.up_votes ?? 0,
      dislikes: comment.down_votes ?? 0,
      replies: [],
      author: {
        id: comment.author_id?.id,
        name: comment.author_id?.steam_name,
        avatar: comment.author_id?.steam_avatar_url,
      },
    };

    map.set(comment.id, transformed);

    if (comment.parent_id == null) {
      topLevel.push(transformed);
    } else {
      const parent = map.get(comment.parent_id);
      if (parent) {
        parent.replies.push(transformed);
      } else {
        // orphaned reply — fallback to top-level
        topLevel.push(transformed);
      }
    }
  }

  return topLevel;
}

/**
 * Enriches a suspect with additional data:
 * - Evidence and report counts.
 * - Steam summary.
 * - Ban status.
 * - Suspicious score.
 */
export async function enrichSuspect(suspect: Suspect): Promise<Suspect> {
  const evidence = await getUserEvidence(suspect.id);
  const reports = await getUserReports(suspect.id);
  const comments = await getUserComments(suspect.id);
  const evidence_count = evidence.length;
  const report_count = reports.length;
  const comment_count = comments.length;
  const steam_summary = await fetchSteamUserSummary(suspect.steam_id_64);
  const ban_status = await fetchSteamBans(suspect.steam_id_64);

  // Calculate suspicious score using all available data
  const suspicious_score = calculateSuspiciousScore({
    ...suspect,
    evidence_count,
    report_count,
    comment_count,
    steam_summary,
    ban_status,
  });

  return {
    ...suspect,
    evidence_count,
    report_count,
    comment_count,
    steam_summary,
    ban_status,
    suspicious_score,
  } as Suspect;
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

    return await enrichSuspect(data[0]);
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
