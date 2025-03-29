"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { SteamAvatar } from "@/components/avatar/reusable-avatar";
import { VoteButton } from "@/components/button/vote-button";
import { ReplyForm } from "@/components/comments/reply-form";
import { deleteComment } from "@/app/comments/actions";

export interface CommentType {
  id: string;
  profileId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
  replies: CommentType[];
}

interface CommentItemProps {
  comment: CommentType;
  currentUserId?: string;
}

export function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);
  const [showReplies, setShowReplies] = useState(false);
  const [respond, setShowRespond] = useState<String | null>(null);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikes(likes - 1);
    } else {
      setLiked(true);
      setLikes(likes + 1);
      if (disliked) {
        setDisliked(false);
        setDislikes(dislikes - 1);
      }
    }
  };

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false);
      setDislikes(dislikes - 1);
    } else {
      setDisliked(true);
      setDislikes(dislikes + 1);
      if (liked) {
        setLiked(false);
        setLikes(likes - 1);
      }
    }
  };

  const handleShowRespond = (id: string) => {
    if (respond == id) {
      setShowRespond(null);
    } else setShowRespond(id);
  };

  const handleDelete = async (commentId: string) => {
    const confirmed = confirm("Are you sure you want to delete this comment?");
    if (!confirmed) return;

    try {
      await deleteComment(commentId);
      // Optionally: trigger re-fetch via callback or global refresh
      location.reload(); // Or lift `setComments` into parent and update state
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Format the date to show "over 1 year ago" style
  const formattedDate = `over ${formatDistanceToNow(comment.createdAt, { addSuffix: false })} ago`;

  // Get initials for avatar fallback
  const initials = comment.author.name
    .split(/\s/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="py-4 border-t border-border first:border-t-0">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <SteamAvatar src={comment.author.avatar} alt={comment.author.name} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium">{comment.author.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {formattedDate}
              {currentUserId === comment.author.id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <div className={"flex flex-row justify-between"}>
            <p className="text-sm mb-2 w-full whitespace-pre-wrap">
              {comment.content}
            </p>

            <div className={"flex flex-row items-center gap-2"}>
              <VoteButton
                count={comment.likes}
                icon={<ThumbsUp className="h-4 w-4" />}
                aria_label={"UpVote"}
              />
              <VoteButton
                count={comment.dislikes}
                icon={<ThumbsDown className="h-4 w-4" />}
                aria_label={"DownVote"}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="mt-4 w-full">
              {/* Reply form - always show */}
              {currentUserId != null && respond === comment.id ? (
                <ReplyForm
                  parentId={comment.id}
                  profileId={comment.profileId}
                  authorId={comment.author.id}
                  handleCancel={() => handleShowRespond(comment.id)}
                />
              ) : (
                <p
                  className={"text-sm cursor-pointer"}
                  onClick={() => handleShowRespond(comment.id)}
                >
                  Reply
                </p>
              )}
              {/* Reply list */}
              {comment.replies.length > 0 && (
                <div className="space-y-4 pl-4 border-l border-muted">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReplies && comment.replies.length > 0 && (
        <div className="ml-11 mt-4 border-l-2 border-muted pl-4 space-y-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="py-2">
              <div className="flex gap-3">
                <Avatar className="h-6 w-6 border">
                  <AvatarImage
                    src={reply.author.avatar}
                    alt={reply.author.name}
                  />
                  <AvatarFallback>
                    {reply.author.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">
                      {reply.author.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(reply.createdAt, {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
