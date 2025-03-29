"use server";

import {
  fetchSupabase,
  mutateSupabase,
} from "@/lib/utils/supabase/helpers/supabase-fetch-helper";

/**
 * Create a new comment
 */
export async function upsertComment({
  profileId,
  authorId,
  content,
}: {
  profileId: string;
  authorId: string;
  content: string;
}) {
  const body = {
    profile_id: profileId,
    author_id: authorId,
    content,
    up_votes: 0,
    down_votes: 0,
    replies: [],
  };

  try {
    await mutateSupabase({
      method: "POST",
      query: "comments",
      body,
    });
  } catch (err) {
    console.error("Failed to create comment:", err);
    throw new Error("Comment creation failed");
  }

  // No return — caller will re-fetch fresh data
}

/**
 * Create a new comment and go put its own id in the replies
 * */
export async function appendReplyToComment({
  parentId,
  replyId,
}: {
  parentId: string;
  replyId: string;
}) {
  const parent = await fetchSupabase({
    query: `comments?id=eq.${parentId}&select=replies`,
    cache: "no-store",
  })
    .then((res) => res.json())
    .then((data) => data[0]);

  const updatedReplies = [...(parent?.replies ?? []), replyId];

  return await mutateSupabase({
    method: "PATCH",
    query: `comments?id=eq.${parentId}`,
    body: { replies: updatedReplies },
  });
}

/**
 * Delete a comment
 * */

export async function deleteComment(commentId: string) {
  return await mutateSupabase({
    method: "DELETE",
    query: `comments?id=eq.${commentId}`,
  });
}
