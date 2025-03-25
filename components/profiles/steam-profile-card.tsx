"use client"

import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {ExternalLink} from "lucide-react"
import Link from "next/link"
import {getStatusBadge} from "@/components/badge/status-badge";

interface SteamProfileCardProps {
  steam_id_64: string
  steam_id_32: string
  steam_url?: string
  firstReported?: string
  banStatus: boolean
  suspiciousScore: number
  cheater: boolean
}

export function SteamProfileCard({
                                   steam_id_64,
                                   steam_id_32,
                                   steam_url,
                                   firstReported,
                                   banStatus,
                                   suspiciousScore, cheater
                                 }: SteamProfileCardProps) {
  const badge = getStatusBadge({
    isCheater: cheater,
    ban_status: banStatus,
    suspicious_score: suspiciousScore
  })


  return (
      <Card>
        <CardHeader>
          <CardTitle>Steam Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Steam ID 64</p>
            <p className="font-mono text-xs text-muted-foreground break-all">{steam_id_64}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Steam ID 32</p>
            <p className="font-mono text-xs text-muted-foreground break-all">{steam_id_32}</p>
          </div>
          {steam_url && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Steam URL</p>
                <p className="text-xs text-muted-foreground break-all">
                  <a
                      href={steam_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-primary"
                  >
                    {steam_url}
                    <ExternalLink className="ml-1 h-3 w-3"/>
                  </a>
                </p>
              </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium">First Reported</p>
            <p className="text-xs text-muted-foreground">
              {firstReported ? new Date(firstReported).toLocaleDateString() : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Status</p>
            <div>
              {badge}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link
                href={steam_url || `https://steamcommunity.com/profiles/${steam_id_64}`}
                target="_blank"
                rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4"/>
              View on Steam
            </Link>
          </Button>
        </CardFooter>
      </Card>
  )
}
