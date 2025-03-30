import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import { SuspectCardGrid } from "@/components/card/suspect-card-grid";
import { getSuspects } from "@/app/profiles/actions";
import { isLoggedIn } from "@/lib/utils";
import { getServerSession } from "@/lib/auth/get-server-session";

export default async function ProfilesPage() {
  const user = await getServerSession();
  const suspects = await getSuspects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suspects</h1>
          <p className="text-muted-foreground">
            Browse and search reported player profiles
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          {isLoggedIn(user) && (
            <Button size="sm" asChild>
              <a href="/reports/new">
                <Plus className="mr-2 h-4 w-4" />
                Report Player
              </a>
            </Button>
          )}
        </div>
      </div>

      {suspects != null ? (
        <SuspectCardGrid suspects={suspects} />
      ) : (
        <p className="text-muted-foreground text-center mt-10">
          No reported profiles found.
        </p>
      )}
    </div>
  );
}
