"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

export interface CommentType {
  id: string;
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
}

export function CommentItem({ comment }: CommentItemProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);
  const [showReplies, setShowReplies] = useState(false);

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
          <Avatar className="h-8 w-8 border">
            <AvatarImage
              src={comment.author.avatar}
              alt={comment.author.name}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium">{comment.author.name}</div>
            <div className="text-xs text-muted-foreground">{formattedDate}</div>
          </div>
          <p className="text-sm mb-2">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${liked ? "text-primary" : "text-muted-foreground"}`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-xs">{likes}</span>
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1 ${disliked ? "text-primary" : "text-muted-foreground"}`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="text-xs">{dislikes}</span>
            </button>
            {comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-muted-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">
                  {showReplies
                    ? "Hide replies"
                    : `Reply (${comment.replies.length})`}
                </span>
              </button>
            )}
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
