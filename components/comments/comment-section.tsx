"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { getUserComments } from "@/app/profiles/actions";
import { upsertComment } from "@/app/comments/actions";
import { toast } from "sonner";
import { CommentType } from "@/lib/types/comment";
import { CommentItem } from "@/components/comments/comment-item";

interface CommentsSectionProps {
  profileId: string;
  currentUserId?: string;
}

export function CommentsSection({
  profileId,
  currentUserId,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    const data = await getUserComments(profileId);
    setComments(data);
  }, [profileId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async () => {
    if (!currentUserId || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await upsertComment({
        profileId,
        authorId: currentUserId,
        content: newComment.trim(),
      });

      await fetchComments();
      setNewComment("");
    } catch (err) {
      console.error("Failed to submit comment:", err);
      toast.error("Failed to submit comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TabsContent value="comments" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Comments Submitted
          </CardTitle>
          <CardDescription>
            {comments.length} comment{comments.length !== 1 && "s"} have been
            submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background rounded-md p-4">
            {currentUserId && (
              <div className="mb-6">
                <Textarea
                  placeholder="Add your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2 min-h-[100px] bg-background border-muted"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    variant="outline"
                  >
                    {isSubmitting ? "Submitting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            )}

            <div>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    refreshCommentsAction={fetchComments}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            {comments.length > 5 && (
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Load More Comments
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
