import React, { FC } from "react";
import Image from "next/image";
import CS2 from "@/public/png/cs2.png";
import { MessageCircle, Video } from "lucide-react";

interface EvidenceItemTopAreaProps {
  evidence_type: string;
  created_at: string;
  game?: string;
}

export const EvidenceItemTopArea: FC<EvidenceItemTopAreaProps> = ({
  evidence_type,
  created_at,
  game,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const evidenceIcon = () => {
    switch (evidence_type) {
      case "description":
        return <MessageCircle className="h-4 w-4 text-primary" />;
      default:
        return <Video className="h-4 w-4 text-primary" />;
    }
  };

  const evidenceGame = () => {
    switch (game) {
      default:
        return (
          <Image
            src={CS2}
            alt={"Counter Strike 2"}
            className={"size-4 rounded-full"}
          />
        );
    }
  };

  return (
    <div className="flex items-start justify-between mb-3">
      <div className={"flex items-center gap-4"}>
        <div className="flex items-center gap-2">
          {evidenceIcon()}
          <span className="badge badge-outline">
            {evidence_type.charAt(0).toUpperCase() + evidence_type.slice(1)}{" "}
            Evidence
          </span>
        </div>

        {game != null && (
          <div className="flex items-center gap-2">
            {evidenceGame()}
            <span className="badge badge-outline">{game}</span>
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {formatDate(created_at)}
      </span>
    </div>
  );
};
