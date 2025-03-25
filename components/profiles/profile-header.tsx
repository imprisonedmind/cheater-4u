import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flag, Share2 } from "lucide-react";
import { StatusBackground } from "@/components/profiles/profile-header-background";
import { SteamAvatar } from "@/components/avatar/reusable-avatar";

interface ProfileHeaderProps {
  profile: {
    id: string;
    steam_name: string;
    steam_id_64: string;
    avatar_url: string | null;
    ban_status: boolean;
    report_count: number;
    cheater: boolean;
    suspicious_score: number;
  };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <Card className="overflow-hidden p-0">
      {/* "Gradient" + "Pattern" based on cheater/suspicious logic */}
      <StatusBackground
        isCheater={profile.cheater}
        ban_status={profile.ban_status}
        suspicious_score={profile.suspicious_score}
      />

      {/* PROFILE INFORMATION */}
      <div className="px-6 pb-6 flex flex-col md:flex-row gap-6 z-[200] items-center">
        <div className="flex-shrink-0 -mt-14">
          <SteamAvatar
            size={128}
            alt={profile.steam_name}
            src={profile.avatar_url ?? ""}
            fallback={profile.steam_name.charAt(0).toUpperCase()}
          />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-xl font-bold">{profile.steam_name}</p>
          <p className="text-sm text-muted-foreground font-mono">
            {profile.steam_id_64}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Flag className="mr-1 h-4 w-4 text-destructive" />
              {profile.report_count} reports
            </span>
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2 self-start my-auto">
          <Button size="sm">
            <Flag className="mr-2 h-4 w-4" />
            Report
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  );
}
