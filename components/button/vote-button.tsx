"use client";
import React, { FC, ReactNode } from "react";

interface VoteButtonProps {
  count: number;
  icon: ReactNode;
  aria_label: string;
  className?: string;
  onClick?: () => void;
}

export const VoteButton: FC<VoteButtonProps> = ({
  count,
  icon,
  aria_label,
  className,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center text-sm hover:text-primary gap-1 cursor-pointer group"
      // onClick={() => onVote(evidence.id, "up")}
      aria-label={aria_label}
    >
      {icon}
      <p>{count}</p>
    </button>
  );
};
