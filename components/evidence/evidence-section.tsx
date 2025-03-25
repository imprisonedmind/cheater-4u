"use client"

import type React from "react"

import { useState } from "react"
import { Video, ThumbsUp, ThumbsDown, ExternalLink, Plus, X } from "lucide-react"

interface Evidence {
  id: string
  evidence_type: string
  evidence_url: string
  content: string
  created_at: string
  user_id: string
  upvotes: number
  downvotes: number
}

interface EvidenceSectionProps {
  evidence: Evidence[]
  profileId: string
}

export function EvidenceSection({ evidence, profileId }: EvidenceSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvidenceUrl, setNewEvidenceUrl] = useState("")
  const [newEvidenceDescription, setNewEvidenceDescription] = useState("")
  const [localEvidence, setLocalEvidence] = useState<Evidence[]>(evidence)

  // Function to handle voting (in a real app, this would call an API)
  const handleVote = (evidenceId: string, voteType: "up" | "down") => {
    setLocalEvidence((prev) =>
        prev.map((item) => {
          if (item.id === evidenceId) {
            if (voteType === "up") {
              return { ...item, upvotes: item.upvotes + 1 }
            } else {
              return { ...item, downvotes: item.downvotes + 1 }
            }
          }
          return item
        }),
    )
  }

  // Function to handle evidence submission (in a real app, this would call an API)
  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate URL (simple check for demonstration)
    if (!newEvidenceUrl.includes("youtube.com") && !newEvidenceUrl.includes("youtu.be")) {
      alert("Please enter a valid YouTube URL")
      return
    }

    // Create new evidence object
    const newEvidence: Evidence = {
      id: `ev-${Date.now()}`,
      evidence_type: "video",
      evidence_url: newEvidenceUrl,
      content: newEvidenceDescription,
      created_at: new Date().toISOString(),
      user_id: "current-user", // In a real app, this would be the actual user ID
      upvotes: 0,
      downvotes: 0,
    }

    // Add to local state
    setLocalEvidence((prev) => [newEvidence, ...prev])

    // Reset form
    setNewEvidenceUrl("")
    setNewEvidenceDescription("")
    setShowAddForm(false)
  }

  // Function to extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  return (
      <div className="space-y-4">
        {/* Add Evidence Button */}
        {!showAddForm ? (
            <button className="btn btn-outline w-full mb-4" onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Evidence
            </button>
        ) : (
            <div className="card bg-secondary/30 mb-4">
              <div className="card-header">
                <h3 className="card-title text-base">Submit New Evidence</h3>
                <button
                    className="btn btn-ghost btn-sm btn-icon absolute top-2 right-2"
                    onClick={() => setShowAddForm(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="card-content">
                <form onSubmit={handleSubmitEvidence} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video URL</label>
                    <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="search-input w-full"
                        value={newEvidenceUrl}
                        onChange={(e) => setNewEvidenceUrl(e.target.value)}
                        required
                    />
                    <p className="text-xs text-muted-foreground">YouTube, Twitch clips, or other video hosting sites</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        placeholder="Describe what happens in the video and at what timestamp the suspicious behavior occurs"
                        className="search-input w-full min-h-[100px]"
                        value={newEvidenceDescription}
                        onChange={(e) => setNewEvidenceDescription(e.target.value)}
                        required
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Submit Evidence
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Evidence List */}
        {localEvidence.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No evidence has been submitted yet.</p>
            </div>
        ) : (
            localEvidence.map((item) => {
              const videoId = item.evidence_url ? getYouTubeVideoId(item.evidence_url) : null

              return (
                  <div key={item.id} className="card bg-secondary/30">
                    <div className="card-content p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <Video className="h-4 w-4 mr-2 text-primary" />
                          <span className="badge badge-outline">Video Evidence</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                      </div>

                      {/* Video Embed */}
                      {videoId && (
                          <div className="mt-3 aspect-video bg-black rounded-md overflow-hidden">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                          </div>
                      )}

                      {/* Description */}
                      <div className="mt-3 text-sm">
                        <p>{item.content}</p>
                      </div>

                      {/* Video Link */}
                      <div className="mt-2">
                        <a
                            href={item.evidence_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:underline text-xs"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          <span>{item.evidence_url}</span>
                        </a>
                      </div>

                      {/* Voting and Metadata */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Submitted by: {item.user_id === "current-user" ? "You" : `User ${item.user_id.substring(0, 8)}...`}
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                              className="flex items-center text-sm hover:text-primary"
                              onClick={() => handleVote(item.id, "up")}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{item.upvotes}</span>
                          </button>
                          <button
                              className="flex items-center text-sm hover:text-destructive"
                              onClick={() => handleVote(item.id, "down")}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            <span>{item.downvotes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              )
            })
        )}
      </div>
  )
}

