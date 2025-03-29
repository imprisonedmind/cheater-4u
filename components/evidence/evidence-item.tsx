import React from "react";
import { ExternalLink, ThumbsDown, ThumbsUp } from "lucide-react";
import { EvidenceThumbnail } from "@/components/evidence/evidence-thumbnail";
import { Evidence } from "@/lib/types/evidence";
import { getEnrichedUser } from "@/app/users/actions";
import { getServerSession } from "@/lib/auth/get-server-session";
import { SteamAvatar } from "@/components/avatar/reusable-avatar";
import { CommentContent } from "@/components/comments/comment-content";
import { VoteButton } from "@/components/button/vote-button";
import { EvidenceItemTopArea } from "@/components/evidence/evidence-item-top-area";

interface EvidenceItemProps {
  evidence: Evidence;
  // onVote: (id: string, vote: "up" | "down") => void;
}

export const EvidenceItem = async ({ evidence }: EvidenceItemProps) => {
  const user = await getServerSession();
  const reporter = await getEnrichedUser(evidence.reporter);

  return (
    <div className="card bg-secondary/30 p-4 rounded-lg">
      <div className={"flex flex-col gap-2"}>
        <EvidenceItemTopArea
          evidence_type={evidence.evidence_type}
          created_at={evidence.created_at}
          game={evidence.game}
        />
        <EvidenceThumbnail evidence={evidence} />
        {evidence.evidence_url !== null && (
          <a
            href={evidence.evidence_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline text-xs"
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            <span>{evidence.evidence_url}</span>
          </a>
        )}
      </div>

      <div className={"flex justify-between p-2 mt-4"}>
        <div className={"flex flex-col gap-2"}>
          <div className="flex items-center gap-2">
            <SteamAvatar
              src={reporter!.steam_summary.avatar_url}
              className={"size-6"}
            />
            <span className="text-sm font-medium text-primary">
              {reporter!.steam_summary.steam_name}
            </span>
          </div>

          {evidence.content != null && (
            <CommentContent content={evidence.content} />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 flex-col">
          <div className="flex items-center space-x-4">
            <VoteButton
              count={evidence.up_votes}
              icon={<ThumbsUp className="h-4 w-4 group-hover:text-pink-600" />}
              aria_label={"UpVote"}
            />
            <VoteButton
              count={evidence.down_votes}
              icon={<ThumbsDown className="h-4 w-4 group-hover:text-red-500" />}
              aria_label={"DownVote"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
