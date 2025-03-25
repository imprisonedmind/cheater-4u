import {createClient} from "@/lib/utils/supabase/server"
import {notFound} from "next/navigation"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {ReportsList} from "@/components/reports/reports-list"
import {EvidenceList} from "@/components/evidence/evidence-list"
import {ProfileStats} from "@/components/profiles/profile-stats"
import {ProfileHeader} from "@/components/profiles/profile-header"
import {AlertTriangle, Clock, Flag} from "lucide-react"
import {CheaterStatusBar} from "@/components/profiles/cheater-status-bar";
import {RelatedProfilesCard} from "@/components/profiles/related-profiles-card";
import {SteamProfileCard} from "@/components/profiles/steam-profile-card";
import {fetchSteamBans, fetchSteamUserSummary} from "@/lib/steam/steamApis";


interface ProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProfilePage({params}: ProfilePageProps) {
  const supabase = await createClient()
  const {id} = await params

  // 1) Fetch the record from "profiles"
  const {data: profile, error} = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()

  if (error || !profile) {
    notFound()
  }

  // 2) Count reports referencing this profile
  const {
    data: reportData,
    error: reportError,
    count: reportCount,
  } = await supabase
      .from("reports")
      .select("*", {count: "exact"})
      .eq("profile_id", profile.id)

  // 3) Count evidence referencing this profile
  const {
    data: evidenceData,
    error: evidenceError,
    count: evidenceCount,
  } = await supabase
      .from("evidence")
      .select("*", {count: "exact"})
      .eq("profile_id", profile.id)

  // 4) Optionally fetch from Steam using `steam_id_64`
  let steam_name = "Unknown"
  let avatar_url = "/placeholder.svg?height=128&width=128"
  let ban_status = false

  if (profile.steam_id_64) {
    // fetch name + avatar
    const summary = await fetchSteamUserSummary(profile.steam_id_64)
    if (summary) {
      steam_name = summary.steam_name
      avatar_url = summary.avatar_url
    }

    // fetch ban info
    const bans = await fetchSteamBans(profile.steam_id_64)
    if (bans?.ban_status) {
      ban_status = true
    }
  }

// 1) Build the base object
  const profileData = {
    ...profile,
    steam_name,
    avatar_url,
    ban_status,
    report_count: reportCount ?? 0,
    evidence_count: evidenceCount ?? 0,
    first_reported: profile.created_at,
    cheater: Boolean(profile.cheater),
  }

// 2) Compute the suspicious score
  let suspicious_score = 0
  if (profileData.cheater) {
    suspicious_score = 999 // or 100, any sentinel
  } else {
    suspicious_score = Math.min((profileData.report_count || 0) * 10, 100)
  }

// 3) Add the `suspicious_score` property to the existing object
  profileData.suspicious_score = suspicious_score


  return (
      <div className="space-y-6">
        <ProfileHeader profile={profileData}/>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left side: TABS for Reports, Evidence, Stats */}
          <div className="md:col-span-2">
            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
              <TabsContent value="reports" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flag className="mr-2 h-5 w-5 text-primary"/>
                      Report History
                    </CardTitle>
                    <CardDescription>
                      This player has been reported {profileData.report_count} times
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReportsList reports={reportData || []}/>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Flag className="mr-2 h-4 w-4"/>
                      Submit New Report
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="evidence" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-primary"/>
                      Evidence Submitted
                    </CardTitle>
                    <CardDescription>
                      {profileData.evidence_count} pieces of evidence have been submitted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EvidenceList evidence={evidenceData || []}/>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Add Evidence
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="stats" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-primary"/>
                      Player Statistics
                    </CardTitle>
                    <CardDescription>Game statistics and tracking data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileStats profileId={id}/>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right side: SteamProfileCard, CheaterStatusBar, RelatedProfilesCard, etc. */}
          <div className="space-y-6">
            <SteamProfileCard
                steam_id_64={profileData.steam_id_64}
                steam_id_32={profileData.steam_id_32}
                steam_url={profileData.steam_url}
                firstReported={profileData.first_reported}
                banStatus={profileData.ban_status}
                suspiciousScore={profileData.suspicious_score}
                cheater={profileData.cheater}
            />

            {/* “Cheater status bar” or suspicious bar, if desired in a card */}
            <Card>
              <CardHeader>
                <CardTitle>Suspicious Score</CardTitle>
                <CardDescription>
                  Based on number of reports, bans, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CheaterStatusBar suspiciousScore={suspicious_score}/>
              </CardContent>
            </Card>

            <RelatedProfilesCard/>
          </div>
        </div>
      </div>
  )
}
