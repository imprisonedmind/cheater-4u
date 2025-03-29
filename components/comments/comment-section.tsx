"use client";

import { TabsContent } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { CommentItem, type CommentType } from "./comment-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Mock data for comments

// Mock data for comments
const mockComments: CommentType[] = [
  {
    id: "1",
    author: {
      id: "user1",
      name: "JohnDoe",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    content:
      "I've played against this person multiple times. Definitely using some kind of aim assistance. The tracking was way too perfect even through smoke.",
    createdAt: new Date(2023, 10, 15),
    likes: 24,
    dislikes: 3,
    replies: [
      {
        id: "2",
        author: {
          id: "user2",
          name: "GameMaster",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content:
          "I agree. I was in the same match and noticed the same behavior. Their reaction time was inhuman.",
        createdAt: new Date(2023, 10, 16),
        likes: 12,
        dislikes: 1,
        replies: [],
      },
      {
        id: "3",
        author: {
          id: "user3",
          name: "ProPlayer",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content:
          "I'm not sure. Some players are just really good. I'd need to see more evidence before making a judgment.",
        createdAt: new Date(2023, 10, 17),
        likes: 8,
        dislikes: 15,
        replies: [],
      },
    ],
  },
  {
    id: "6",
    author: {
      id: "user5",
      name: "GameDev",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    content:
      "I've analyzed their gameplay patterns across multiple matches. The consistency in their aim suggests they might be using some form of assistance, but it's hard to be 100% certain without more data.",
    createdAt: new Date(2023, 11, 5),
    likes: 32,
    dislikes: 7,
    replies: [],
  },
  {
    id: "7",
    author: {
      id: "user6",
      name: "Moderator",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    content:
      "We're currently investigating this player. Please continue to submit evidence if you encounter them in your matches.",
    createdAt: new Date(2023, 11, 10),
    likes: 45,
    dislikes: 0,
    replies: [],
  },
];

interface CommentsSectionProps {
  profileId: string;
}

export function CommentsSection({ profileId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newCommentObj: CommentType = {
        id: `comment-${Date.now()}`,
        author: {
          id: "current-user",
          name: "CurrentUser",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content: newComment,
        createdAt: new Date(),
        likes: 0,
        dislikes: 0,
        replies: [],
      };

      setComments([newCommentObj, ...comments]);
      setNewComment("");
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <TabsContent value="comments" className={"mt-4"}>
      <Card>
        <CardHeader>
          <CardTitle className={"flex items-center"}>
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Comments Submitted
          </CardTitle>
          <CardDescription>
            {comments.length} comments have been submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background rounded-md">
            <div className="p-4">
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

              <div>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
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
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
