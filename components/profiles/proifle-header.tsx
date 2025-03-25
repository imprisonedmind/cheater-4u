import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Flag, Share2 } from "lucide-react"

interface ProfileHeaderProps {
  profile: {
    id: string
    steam_name: string
    steam_id_64: string
    avatar_url: string | null
    ban_status: boolean
    report_count: number
  }
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
          <div className="absolute inset-0 bg-grid-white/5" />
        </div>
        <div className="p-6 flex flex-col md:flex-row gap-6 -mt-12">
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full border-4 border-background bg-card overflow-hidden">
              {profile.avatar_url ? (
                  <img
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.steam_name}
                      className="h-full w-full object-cover"
                  />
              ) : (
                  <div className="h-full w-full flex items-center justify-center bg-secondary text-secondary-foreground text-2xl font-bold">
                    {profile.steam_name.charAt(0).toUpperCase()}
                  </div>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-2xl font-bold">{profile.steam_name}</h1>
              {profile.ban_status ? (
                  <Badge variant="destructive">Banned</Badge>
              ) : (
                  <Badge variant="secondary">Active</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">{profile.steam_id_64}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Flag className="mr-1 h-4 w-4 text-destructive" />
              {profile.report_count} reports
            </span>
            </div>
          </div>
          <div className="flex flex-row md:flex-col gap-2 self-start mt-4 md:mt-0">
            <Button size="sm">
              <Flag className="mr-2 h-4 w-4" />
              Report
            </Button>
            <Button size="sm" variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </Card>
  )
}

