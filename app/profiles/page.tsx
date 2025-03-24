import { createClient } from "@/lib/utils/supabase/server"
import type { Suspect } from "@/lib/types/suspect"
import { SuspectTable } from "@/components/table/suspect-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"

export default async function UsersPage() {
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
      <main className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reported Profiles</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Report
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Suspects Database</CardTitle>
          </CardHeader>
          <CardContent>
            <SuspectTable suspects={suspects} />
          </CardContent>
        </Card>
      </main>
  )
}

