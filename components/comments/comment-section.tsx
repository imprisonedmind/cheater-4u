"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
}

interface CommentSectionProps {
  comments: Comment[]
  profileId: string
}

export function CommentSection({ comments, profileId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [localComments, setLocalComments] = useState<Comment[]>(comments)

  // Function to handle comment submission (in a real app, this would call an API)
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    // Create new comment object
    const comment: Comment = {
      id: `cm-${Date.now()}`,
      content: newComment,
      created_at: new Date().toISOString(),
      user_id: "current-user", // In a real app, this would be the actual user ID
    }

    // Add to local state
    setLocalComments((prev) => [comment, ...prev])

    // Reset form
    setNewComment("")
  }

  // Format date to relative time (e.g., "2 days ago")
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  return (
      <div className="space-y-4">
        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <input
              type="text"
              placeholder="Add a comment..."
              className="search-input flex-1"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
          />
          <button type="submit" className="btn btn-primary">
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Comments List */}
        {localComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet. Be the first to comment!</p>
            </div>
        ) : (
            <div className="space-y-4 mt-4">
              {localComments.map((comment) => (
                  <div key={comment.id} className="bg-secondary/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">
                    {comment.user_id === "current-user" ? "You" : comment.user_id.charAt(0).toUpperCase()}
                  </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">
                            {comment.user_id === "current-user" ? "You" : `User ${comment.user_id.substring(0, 8)}...`}
                          </div>
                          <div className="text-xs text-muted-foreground">{getRelativeTime(comment.created_at)}</div>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  )
}

