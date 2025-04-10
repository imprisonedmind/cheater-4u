import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flag, Share2, Swords } from "lucide-react";
import { StatusBackground } from "@/components/profiles/profile-header-background";
import { SteamAvatar } from "@/components/avatar/reusable-avatar";
import { Suspect } from "@/lib/types/suspect";
import { isAuthoritative, isBanned, isLoggedIn } from "@/lib/utils";
import { getServerSession } from "@/lib/auth/get-server-session";
import { toggleCheaterStatus } from "@/app/users/actions";
import { ClientMarkAsCheater } from "@/components/button/client-mark-as-cheater";

export async function ProfileHeader({ suspect }: { suspect: Suspect }) {
  const user = await getServerSession();
  console.log(user);
  const isAuthorized = isAuthoritative(user);

  return (
    <Card className="overflow-hidden p-0">
      {/* "Gradient" + "Pattern" based on cheater/suspicious logic */}
      <StatusBackground
        isCheater={suspect.cheater ?? false}
        ban_status={isBanned(suspect.ban_status)}
        suspicious_score={suspect.suspicious_score ?? 0}
        height={"h-32"}
      />

      {/* suspect INFORMATION */}
      <div className="px-6 pb-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-shrink-0 -mt-14">
          <SteamAvatar
            className={"size-32"}
            alt={suspect.steam_summary.steam_name}
            src={suspect.steam_summary.avatar_url ?? ""}
            fallback={suspect.steam_summary.steam_name?.charAt(0).toUpperCase()}
          />
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-xl font-bold">
            {suspect.steam_summary.steam_name}
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            {suspect.steam_id_64}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Flag className="mr-1 h-4 w-4 text-destructive" />
              {suspect.report_count} reports
            </span>
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-2 self-start my-auto">
          {isLoggedIn(user) && (
            <Button size="sm">
              <Flag className="mr-2 h-4 w-4" />
              Report
            </Button>
          )}

          <Button size="sm" variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>

          <ClientMarkAsCheater isAuthorized={isAuthorized} suspect={suspect} />
        </div>
      </div>
    </Card>
  );
}
