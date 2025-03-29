"use server";

import {
  fetchSteamBans,
  fetchSteamUserSummary,
  resolveVanityURL,
} from "@/lib/steam/steamApis";
import { createClient } from "@/lib/utils/supabase/server";
import { Suspect } from "@/lib/types/suspect";
import { Evidence } from "@/lib/types/evidence";
import {
  RelatedProfileData,
  RelatedProfileIdentifier,
} from "@/lib/types/related_profiles";
import { calculateSuspiciousScore } from "@/lib/utils";
import { fetchSupabase } from "@/lib/utils/supabase/helpers/supabase-fetch-helper";
import { CustomReport } from "@/lib/types/report";
import { CommentType } from "@/lib/types/comment";

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
export async function getUserComments(
  profileId: string,
  currentUserId?: string,
) {
  const query = `
    comments?select=id,created_at,content,parent_id,author_id(
      id,steam_name,steam_avatar_url
    )&profile_id=eq.${profileId}&order=created_at.asc
  `.replace(/\s+/g, "");

  const commentRes = await fetchSupabase({
    query,
    tags: [`comment-${profileId}`],
  });
  if (!commentRes.ok) {
    console.error("Failed to fetch comments:", await commentRes.text());
    return [];
  }

  const comments = await commentRes.json();

  // Step 2: Fetch votes per comment
  const voteRes = await fetchSupabase({
    query: `comment_votes?select=comment_id,vote_type,user_id&comment_id=in.(${comments
      .map((c: any) => c.id)
      .join(",")})`,
    cache: "no-cache",
    revalidate: 0,
  });

  const allVotes: Array<{
    comment_id: string;
    user_id: string;
    vote_type: "like" | "dislike";
  }> = voteRes.ok ? await voteRes.json() : [];

  // Build a lookup: commentId => votes[]
  const voteMap = new Map<
    string,
    { likes: number; dislikes: number; userVote?: "like" | "dislike" }
  >();
  for (const comment of comments) {
    const votes = allVotes.filter((v) => v.comment_id === comment.id);
    const likes = votes.filter((v) => v.vote_type === "like").length;
    const dislikes = votes.filter((v) => v.vote_type === "dislike").length;
    const userVote = votes.find((v) => v.user_id === currentUserId)?.vote_type;
    voteMap.set(comment.id, { likes, dislikes, userVote });
  }

  // Step 3: Threadify and map into CommentType
  const topLevel: CommentType[] = [];
  const map = new Map<number, CommentType>();

  for (const comment of comments) {
    const votes = voteMap.get(comment.id) ?? { likes: 0, dislikes: 0 };

    const transformed: CommentType = {
      id: comment.id,
      profileId,
      createdAt: comment.created_at ? new Date(comment.created_at) : new Date(),
      content: comment.content,
      likes: votes.likes,
      dislikes: votes.dislikes,
      userVote: votes.userVote,
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
    const response = await fetchSupabase({ query, tags: ["suspects"] });
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
