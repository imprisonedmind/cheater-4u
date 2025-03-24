"use client"

import type { Suspect } from "@/lib/types/suspect"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Flag } from "lucide-react"
import Link from "next/link"

interface SuspectTableProps {
  suspects: Suspect[]
}

export function SuspectTable({ suspects }: SuspectTableProps) {
  return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Steam Profile</TableHead>
              <TableHead>Steam ID</TableHead>
              <TableHead className="text-center">Reports</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suspects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No reported profiles found.
                  </TableCell>
                </TableRow>
            ) : (
                suspects.map((suspect) => (
                    <TableRow key={suspect.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                            {suspect.avatar_url ? (
                                <img
                                    src={suspect.avatar_url || "/placeholder.svg"}
                                    alt={suspect.steam_name}
                                    className="h-10 w-10 rounded-full"
                                />
                            ) : (
                                <span className="text-xs">{suspect.steam_name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{suspect.steam_name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{suspect.steam_url}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{suspect.steam_id_64}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold">{suspect.report_count}</span>
                          <div className="w-16 progress-bar mt-1">
                            <div
                                className="progress-bar-fill progress-bar-fill-positive"
                                style={{ width: `${Math.min(suspect.report_count * 10, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {suspect.ban_status ? (
                            <Badge variant="destructive">Banned</Badge>
                        ) : (
                            <Badge variant="secondary">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/profiles/${suspect.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon">
                            <Flag className="h-4 w-4" />
                            <span className="sr-only">Report</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
  )
}

