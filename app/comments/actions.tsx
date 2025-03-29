"use server";

import { mutateSupabase } from "@/lib/utils/supabase/helpers/supabase-fetch-helper";

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
    up_votes: 0,
    down_votes: 0,
    ...(parentId && { parent_id: parentId }), // only if replying
  };

  try {
    const [created] = await mutateSupabase({
      method: "POST",
      query: "comments",
      body,
      prefer: "return=representation",
    });

    return created;
  } catch (err) {
    console.error("Failed to create comment:", err);
    throw new Error("Comment creation failed");
  }
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
