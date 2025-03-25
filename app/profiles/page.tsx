import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/utils/supabase/server"
import type { Suspect } from "@/lib/types/suspect"
import { SuspectTable } from "@/components/table/suspect-table"
import { Plus, Filter } from "lucide-react"
import {SuspectCardGrid} from "@/components/card/suspect-card-grid";

export default async function ProfilesPage() {
  const supabase = await createClient()
  const { data: profiles, error } = await supabase.from("profiles").select(`
    id,
    steam_id_64,
    steam_url,
    reports (
      id
    )
  `)

  if (error) throw new Error(error.message)

  // Transform data to match your Suspect interface
  const suspects: Suspect[] = (profiles ?? []).map((profile) => ({
    id: profile.id,
    steam_name: "Unknown", // or real field if you have it
    steam_id_64: profile.steam_id_64,
    steam_url: profile.steam_url,
    avatar_url: null,
    ban_status: false,
    report_count: profile.reports?.length || 0,
  }))

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profiles</h1>
            <p className="text-muted-foreground">Browse and search reported player profiles</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" asChild>
              <a href="/reports/page/new">
                <Plus className="mr-2 h-4 w-4" />
                Report Player
              </a>
            </Button>
          </div>
        </div>

        <SuspectCardGrid suspects={suspects} />
      </div>
  )
}

