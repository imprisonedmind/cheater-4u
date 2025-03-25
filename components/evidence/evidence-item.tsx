import React from "react";
import { ExternalLink, ThumbsDown, ThumbsUp, Video } from "lucide-react";
import { EvidenceThumbnail } from "@/components/evidence/evidence-thumbnail";
import { Evidence } from "@/lib/types/evidence";

interface EvidenceItemProps {
  evidence: Evidence;
  onVote: (id: string, vote: "up" | "down") => void;
}

export const EvidenceItem = ({ evidence, onVote }: EvidenceItemProps) => {
  return (
    <div className="card bg-secondary/30 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <Video className="h-4 w-4 mr-2 text-primary" />
          <span className="badge badge-outline">
            {evidence.evidence_type.charAt(0).toUpperCase() +
              evidence.evidence_type.slice(1)}{" "}
            Evidence
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(evidence.created_at).toLocaleDateString()}
        </span>
      </div>

      <EvidenceThumbnail evidence={evidence} />

      <div className="mt-3 text-sm">
        <p>{evidence.content}</p>
      </div>

      <div className="mt-2">
        <a
          href={evidence.evidence_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-primary hover:underline text-xs"
        >
          <ExternalLink className="mr-1 h-3 w-3" />
          <span>{evidence.evidence_url}</span>
        </a>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Submitted by:{" "}
          {evidence.profile_id === "current-user"
            ? "You"
            : `User ${evidence.profile_id.substring(0, 8)}...`}
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="flex items-center text-sm hover:text-primary"
            onClick={() => onVote(evidence.id, "up")}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {/*<span>{evidence.upvotes}</span>*/}
          </button>
          <button
            className="flex items-center text-sm hover:text-destructive"
            onClick={() => onVote(evidence.id, "down")}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            {/*<span>{evidence.downvotes}</span>*/}
          </button>
        </div>
      </div>
    </div>
  );
};
