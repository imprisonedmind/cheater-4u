"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface ProfileStatsProps {
  profileId: string
}

interface GameStats {
  game: string
  kd_ratio: number
  headshot_percentage: number
  matches_played: number
  win_rate: number
  suspicious_score: number
}

export function ProfileStats({ profileId }: ProfileStatsProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<GameStats[]>([])

  useEffect(() => {
    // Simulate fetching stats from an API
    const timer = setTimeout(() => {
      // Mock data - in production, you'd fetch this from your API
      setStats([
        {
          game: "CS2",
          kd_ratio: 2.87,
          headshot_percentage: 78.5,
          matches_played: 342,
          win_rate: 92.3,
          suspicious_score: 87,
        },
        {
          game: "Valorant",
          kd_ratio: 2.12,
          headshot_percentage: 65.2,
          matches_played: 128,
          win_rate: 84.1,
          suspicious_score: 72,
        },
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [profileId])

  if (loading) {
    return (
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-secondary h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-secondary rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-secondary rounded"></div>
                <div className="h-4 bg-secondary rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
    )
  }

  if (stats.length === 0) {
    return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No game statistics available for this player.</p>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{stat.game}</h3>
                  <SuspiciousScore score={stat.suspicious_score} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <StatItem label="K/D Ratio" value={stat.kd_ratio.toFixed(2)} suspicious={stat.kd_ratio > 2.5} />
                  <StatItem
                      label="Headshot %"
                      value={`${stat.headshot_percentage.toFixed(1)}%`}
                      suspicious={stat.headshot_percentage > 70}
                  />
                  <StatItem label="Matches" value={stat.matches_played.toString()} suspicious={false} />
                  <StatItem label="Win Rate" value={`${stat.win_rate.toFixed(1)}%`} suspicious={stat.win_rate > 90} />
                </div>
              </CardContent>
            </Card>
        ))}
      </div>
  )
}

function SuspiciousScore({ score }: { score: number }) {
  let color = "bg-success"
  let label = "Normal"

  if (score >= 85) {
    color = "bg-destructive"
    label = "Highly Suspicious"
  } else if (score >= 70) {
    color = "bg-orange-500"
    label = "Suspicious"
  } else if (score >= 50) {
    color = "bg-yellow-500"
    label = "Questionable"
  }

  return (
      <div className="flex items-center space-x-2">
        <Badge variant={score >= 85 ? "destructive" : "outline"}>{label}</Badge>
        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${score}%` }}></div>
        </div>
      </div>
  )
}

function StatItem({ label, value, suspicious }: { label: string; value: string; suspicious: boolean }) {
  return (
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`font-medium ${suspicious ? "text-destructive" : ""}`}>
        {value}
          {suspicious && " ⚠️"}
      </span>
      </div>
  )
}

