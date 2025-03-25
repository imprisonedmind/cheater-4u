import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Report {
  id: string
  reporter_ip_hash: string
  reported_at: string
}

interface ReportsListProps {
  reports: Report[]
}

export function ReportsList({ reports }: ReportsListProps) {
  // Sort reports by date (newest first)
  const sortedReports = [...reports].sort(
      (a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime(),
  )

  return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report ID</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No reports found.
                  </TableCell>
                </TableRow>
            ) : (
                sortedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-xs">{report.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {report.reporter_ip_hash.substring(0, 8)}...
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(report.reported_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge>Verified</Badge>
                      </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
  )
}

