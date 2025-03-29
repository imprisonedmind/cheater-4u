"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { upsertComment } from "@/app/comments/actions";

interface ReplyFormProps {
  parentId: string;
  profileId: string;
  authorId: string;
  handleCancelAction: () => void;
  refreshCommentsAction: () => void; // 🆕
}

export function ReplyForm({
  parentId,
  profileId,
  authorId,
  handleCancelAction,
  refreshCommentsAction,
}: ReplyFormProps) {
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      // 1. Create reply comment
      await upsertComment({
        profileId,
        authorId,
        content: replyText.trim(),
        parentId,
      });

      // Reset UI
      setReplyText("");
      handleCancelAction();
      refreshCommentsAction();
    } catch (err) {
      console.error("Failed to submit reply:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 !w-full">
      <Textarea
        placeholder="Write a reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        className="min-h-[80px] !w-full"
      />
      <div className="flex justify-end gap-2">
        <Button variant="destructive" onClick={handleCancelAction}>
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={handleReply}
          disabled={loading || !replyText.trim()}
        >
          {loading ? "Replying..." : "Post Reply"}
        </Button>
      </div>
    </div>
  );
}
