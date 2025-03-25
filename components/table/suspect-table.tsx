"use client"

import type { Suspect } from "@/lib/types/suspect"
import Link from "next/link"
import { Eye, Flag } from 'lucide-react'

interface SuspectTableProps {
  suspects: Suspect[]
}

export function SuspectTable({ suspects }: SuspectTableProps) {
  return (
      <div className="table-container">
        <table>
          <thead>
          <tr>
            <th>Steam Profile</th>
            <th>Steam ID</th>
            <th className="text-center">Reports</th>
            <th className="text-center">Status</th>
            <th className="text-right">Actions</th>
          </tr>
          </thead>
          <tbody>
          {suspects.length === 0 ? (
              <tr>
                <td colSpan={5} className="h-24 text-center">
                  No reported profiles found.
                </td>
              </tr>
          ) : (
              suspects.map((suspect) => (
                  <tr key={suspect.id}>
                    <td className="font-medium">
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
                    </td>
                    <td className="font-mono text-xs">{suspect.steam_id_64}</td>
                    <td className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">{suspect.report_count}</span>
                        <div className="w-16 progress-bar mt-1">
                          <div
                              className="progress-bar-fill progress-bar-fill-positive"
                              style={{ width: `${Math.min(suspect.report_count * 10, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      {suspect.ban_status ? (
                          <span className="badge badge-destructive">Banned</span>
                      ) : (
                          <span className="badge badge-secondary">Active</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/profiles/${suspect.id}`} className="btn btn-outline btn-sm btn-icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                        <button className="btn btn-outline btn-sm btn-icon">
                          <Flag className="h-4 w-4" />
                          <span className="sr-only">Report</span>
                        </button>
                      </div>
                    </td>
                  </tr>
              ))
          )}
          </tbody>
        </table>
      </div>
  )
}
