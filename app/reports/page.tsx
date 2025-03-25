import {Button} from "@/components/ui/button"
import {Plus} from "lucide-react"
import Link from "next/link"
import {createClient} from "@/lib/utils/supabase/server"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"

interface Report {
  id: string
  reporter_ip_hash: string
  reported_at: string
  profile: {
    id: string
    steam_id_64: string
    steam_url: string | null
  } | null
}

export default async function ReportsPage() {
  const supabase = await createClient()

  // Fetch reports with profile information
  const {data: reports, error} = await supabase
      .from("reports")
      .select(`
      id,
      reporter_ip_hash,
      reported_at,
      profile:profile_id (
        id,
        steam_id_64,
        steam_url
      )
    `)
      .order("reported_at", {ascending: false})

  if (error) {
    console.error("Error fetching reports:", error)
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">View and manage reports of suspected cheaters</p>
          </div>
          <Button asChild>
            <Link href="/reports/new">
              <Plus className="mr-2 h-4 w-4"/>
              New Report
            </Link>
          </Button>
        </div>


        {!reports || reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No reports have been submitted yet.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/reports/page/new">Submit your first report</Link>
              </Button>
            </div>
        ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-xs">{report.id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {report.reporter_ip_hash.substring(0, 8)}...
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.reported_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {report.profile ? (
                              <Link href={`/profiles/${report.profile.id}`} className="text-primary hover:underline">
                                {report.profile.steam_id_64.substring(0, 10)}...
                              </Link>
                          ) : (
                              <span className="text-muted-foreground">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge>Verified</Badge>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        )}
      </div>
  )
}

