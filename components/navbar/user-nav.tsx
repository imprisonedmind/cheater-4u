import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Settings } from "lucide-react";
import { getServerSession } from "@/lib/auth/get-server-session";
import { isLoggedIn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SteamAvatar } from "@/components/avatar/reusable-avatar";

export async function UserNav() {
  const user = await getServerSession();

  return (
    <nav className={"mt-1"}>
      {isLoggedIn(user) ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={"size-8 !p-0 rounded-full"}>
              <SteamAvatar
                src={user.steam_avatar_url}
                alt={user.steam_name}
                className={"size-full"}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.steam_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  Welcome, enjoy your stay.
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/api/auth/logout">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild variant="secondary">
          <a href="/api/auth/steam">
            <LogIn className="mr-2 h-4 w-4" /> Sign in with Steam
          </a>
        </Button>
      )}
    </nav>
  );
}
