"use client";

import type { Suspect } from "@/lib/types/suspect";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Flag } from "lucide-react";
import Link from "next/link";
import { SteamAvatar } from "@/components/avatar/reusable-avatar";
import { StatusBackground } from "@/components/profiles/profile-header-background";
import { getStatusBadge } from "@/components/badge/status-badge";
import { CheaterStatusBar } from "@/components/profiles/cheater-status-bar";

/**
 * Matches the "CS skin card" look with:
 * - Banner gradient (color-coded based on cheater/banned/suspicious logic)
 * - A bottom region showing ID, report counts, suspicious bar, etc.
 */
interface SuspectCardGridProps {
  suspects: Suspect[];
}

export function SuspectCardGrid({ suspects }: SuspectCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {suspects.map((suspect) => {
        const badge = getStatusBadge({
          isCheater: suspect.cheater ?? false,
          ban_status: suspect.ban_status ?? false,
          suspicious_score: suspect.suspicious_score ?? 0,
        });

        // 1) Decide final suspicious_score
        //    If "cheater" is true, override to 999 to indicate forced CHEATER
        let suspicious_score = suspect.suspicious_score ?? 0;
        if (suspect.cheater || suspect.ban_status) {
          suspicious_score = 999;
        }

        return (
          <Card
            key={suspect.id}
            className="
              overflow-hidden
              rounded-xl
              border border-border bg-card shadow
              transition-transform hover:scale-[1.01]
              p-0
            "
          >
            {/* Banner w/ gradient + avatar */}
            <div className={`relative h-24 w-full `}>
              <StatusBackground
                height={"h-full"}
                isCheater={suspect.cheater ?? false}
                ban_status={suspect.ban_status ?? false}
                suspicious_score={suspect.suspicious_score ?? 0}
              />
            </div>

            {/* Bottom content */}
            <div className="flex flex-col gap-4 p-4 -mt-24">
              <div className={"mx-auto w-fit"}>
                <SteamAvatar
                  src={suspect.avatar_url}
                  alt={suspect.steam_name}
                  size={128}
                />
              </div>

              <div className={"flex flex-col"}>
                <div className="text-lg font-bold truncate">
                  {suspect.steam_name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {suspect.steam_url}
                </div>
                {/*<div className="text-xs font-mono text-muted-foreground break-all">*/}
                {/*  {suspect.steam_id_64}*/}
                {/*</div>*/}
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Flag className="mr-1 h-4 w-4 text-destructive" />
                  {suspect.report_count} reports
                </span>
              </div>

              {/* “Account Standing” bar */}
              <CheaterStatusBar
                suspiciousScore={suspicious_score}
                cheater={suspect.cheater}
                ban_status={suspect.ban_status}
              />
              {/* Bottom-right icons */}
              <div className="flex justify-between space-x-2 pt-2">
                {badge}
                <div className={"flex flex-row gap-2"}>
                  <Button variant="outline" size="icon">
                    <Flag className="h-4 w-4" />
                    <span className="sr-only">Report</span>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/profiles/${suspect.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Profile</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
