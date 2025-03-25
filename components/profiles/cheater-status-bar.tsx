"use client";

interface CheaterStatusBarProps {
  suspiciousScore: number; // 0 to 100, or 999 if forced
  cheater?: boolean; // if true, override everything
  ban_status?: boolean; // if true, override everything
  label?: string;
}

/**
 * Renders a bar from 0% to 100% colored according to suspiciousScore.
 * If cheater===true, overrides everything with a “CHEATER” style.
 */
export function CheaterStatusBar({
  suspiciousScore,
  cheater = false,
  ban_status = false,
  label = "Account Standing",
}: CheaterStatusBarProps) {
  // Normal logic for suspicious score
  let scoreColor = "bg-success";
  if (ban_status) {
    scoreColor = "bg-banned";
  } else if (cheater) {
    scoreColor = "bg-warning";
  } else if (suspiciousScore >= 70) {
    scoreColor = "bg-orange-500";
  } else if (suspiciousScore >= 50) {
    scoreColor = "bg-yellow-500";
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{suspiciousScore}%</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${scoreColor} transition-all`}
          style={{ width: `${suspiciousScore}%` }}
        />
      </div>
    </div>
  );
}
