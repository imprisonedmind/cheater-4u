"use server";

import {
  fetchSupabase,
  mutateSupabase,
} from "@/lib/utils/supabase/helpers/supabase-fetch-helper";
import { revalidateTag } from "next/cache";

/**
 * Create a new comment or reply
 */
export async function upsertComment({
  profileId,
  authorId,
  content,
  parentId, // ✅ used for replies
}: {
  profileId: string;
  authorId: string;
  content: string;
  parentId?: string;
}) {
  const body = {
    profile_id: profileId,
    author_id: authorId,
    content,
    ...(parentId && { parent_id: parentId }), // only if replying
  };

  try {
    const [created] = await mutateSupabase({
      method: "POST",
      query: "comments",
      body,
      prefer: "return=representation",
    });

    revalidateTag(`comment-${profileId}`);
    return created;
  } catch (err) {
    console.error("Failed to create comment:", err);
    throw new Error("Comment creation failed");
  }
}

/**
 * Delete a comment
 * */

export async function deleteComment(commentId: string, profileId: string) {
  const mutate = await mutateSupabase({
    method: "DELETE",
    query: `comments?id=eq.${commentId}`,
  });

  revalidateTag(`comment-${profileId}`);
  return mutate;
}

/**
 * Toggle a user's vote (like/dislike) on a comment.
 */
export async function toggleCommentVote(
  commentId: string,
  userId: string,
  voteType: "like" | "dislike",
) {
  const urlParams = new URLSearchParams({
    comment_id: `eq.${commentId}`,
    user_id: `eq.${userId}`,
    select: "*",
  });

  const res = await fetchSupabase({
    query: `comment_votes?${urlParams.toString()}`,
    cache: "no-store",
  });

  const existing = await res.json();

  if (!Array.isArray(existing)) {
    throw new Error("Unexpected response when checking for existing vote.");
  }

  const currentVote = existing[0];

  if (currentVote) {
    if (currentVote.vote_type === voteType) {
      // User is toggling off their vote
      await mutateSupabase({
        method: "DELETE",
        query: `comment_votes?id=eq.${currentVote.id}`,
      });
    } else {
      // Switch vote type
      await mutateSupabase({
        method: "PATCH",
        query: `comment_votes?id=eq.${currentVote.id}`,
        body: {
          vote_type: voteType,
        },
        prefer: "return=representation",
      });
    }
  } else {
    // No vote exists → insert new one
    await mutateSupabase({
      method: "POST",
      query: "comment_votes",
      body: {
        comment_id: commentId,
        user_id: userId,
        vote_type: voteType,
      },
      prefer: "return=representation",
    });
  }
}
