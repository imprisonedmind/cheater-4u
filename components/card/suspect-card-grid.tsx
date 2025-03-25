"use client"

import type {Suspect} from "@/lib/types/suspect"
import {Card} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Eye, Flag} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SuspectCardGridProps {
  suspects: Suspect[]
}

/**
 * Matches the "CS skin card" look with:
 * - Banner gradient (color-coded based on ban/report count)
 * - Red separator line
 * - Bottom content with ID, report count, suspicious bar, actions
 */
export function SuspectCardGrid({suspects}: SuspectCardGridProps) {
  if (suspects.length === 0) {
    return <p className="text-muted-foreground text-center mt-10">No reported profiles found.</p>
  }

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {suspects.map((suspect) => {
          const {
            id,
            steam_name = "Unknown",
            steam_id_64,
            steam_url,
            avatar_url,
            report_count = 0,
            ban_status,
            suspicious_score = 0,
          } = suspect

          // Gradient behind the avatar
          // - banned => red
          // - >5 reports => orange
          // - >1 report => yellow
          // - otherwise => green
          let gradientClass = "from-green-600 to-green-800"
          if (ban_status) {
            gradientClass = "from-red-600 to-red-800"
          } else if (report_count > 5) {
            gradientClass = "from-orange-500 to-orange-700"
          } else if (report_count > 1) {
            gradientClass = "from-yellow-400 to-yellow-600"
          }

          // Suspicious Score color
          // e.g. 85%+ => red, 70%+ => orange, 50%+ => yellow, else green
          let scoreColor = "bg-success"
          if (suspicious_score >= 85) {
            scoreColor = "bg-destructive"
          } else if (suspicious_score >= 70) {
            scoreColor = "bg-orange-500"
          } else if (suspicious_score >= 50) {
            scoreColor = "bg-yellow-500"
          }

          let borderColour = "border-green-500"
          if (suspicious_score >= 85) {
            scoreColor = "border-red-500"
          } else if (suspicious_score >= 70) {
            scoreColor = "border-orange-500"
          } else if (suspicious_score >= 50) {
            scoreColor = "border-yellow-500"
          }
          return (
              <Card key={id}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow transition-transform hover:scale-[1.01] p-0">
                {/* Banner w/ gradient + avatar */}
                <div className={`relative h-44 w-full border-b-4 ${borderColour}`}>
                  {avatar_url ? (
                      <Image
                          src={avatar_url}
                          alt={steam_name}
                          fill
                          className="object-cover opacity-40"
                          placeholder="empty"
                          sizes="(max-width: 768px) 100vw, 33vw"
                      />
                  ) : (
                      <div
                          className="absolute inset-0 flex items-center justify-center bg-black text-white text-xl opacity-40">
                        {steam_name[0]}
                      </div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-b ${gradientClass} opacity-80`}/>
                </div>

                {/* Bottom content */}
                <div className="p-4 space-y-3">
                  <div className="text-sm font-semibold truncate">{steam_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{steam_url}</div>
                  <div className="text-xs font-mono text-muted-foreground break-all">{steam_id_64}</div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      <span className="font-bold">{report_count}</span> reports
                    </p>
                    {ban_status ? (
                        <Badge variant="destructive">Banned</Badge>
                    ) : report_count > 1 ? (
                        <Badge variant="outline">Suspicious</Badge>
                    ) : (
                        <Badge variant="secondary">Good</Badge>
                    )}
                  </div>

                  {/* “Account Standing” bar (like your float bar) */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Account Standing</span>
                      <span>{suspicious_score}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                          className={`h-full ${scoreColor} transition-all`}
                          style={{width: `${suspicious_score}%`}}
                      />
                    </div>
                  </div>

                  {/* Bottom-right icons */}
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/profiles/${id}`}>
                        <Eye className="h-4 w-4"/>
                        <span className="sr-only">View Profile</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon">
                      <Flag className="h-4 w-4"/>
                      <span className="sr-only">Report</span>
                    </Button>
                  </div>
                </div>
              </Card>
          )
        })}
      </div>
  )
}
