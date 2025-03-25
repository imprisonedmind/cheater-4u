import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsList } from "@/components/reports/reports-list";
import { ProfileStats } from "@/components/profiles/profile-stats";
import { AlertTriangle, Clock, Flag } from "lucide-react";
import { CheaterStatusBar } from "@/components/profiles/cheater-status-bar";
import { SteamProfileCard } from "@/components/profiles/steam-profile-card";
import { EvidenceSection } from "@/components/evidence/evidence-section";
import {
  fetchEnrichedSuspectsAction,
  fetchEvidenceForProfile,
  fetchReportsForUser,
} from "@/app/profiles/actions";
import { Suspect } from "@/lib/types/suspect";
import { ProfileHeader } from "@/components/profiles/profile-header";
import { Evidence } from "@/lib/types/evidence";
import RelatedProfilesCard from "@/components/profiles/related-profiles-card";
import { CustomReport } from "@/lib/types/report";
import { isProd } from "@/lib/utils";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const { data } = await fetchEnrichedSuspectsAction({ id: id });
  const suspect = data as Suspect;

  const e = await fetchEvidenceForProfile(suspect.id);
  const evidence = e as unknown as Evidence[];

  const r = await fetchReportsForUser(suspect.id);
  const reports = r as unknown as CustomReport[];

  return (
    <div className="space-y-6">
      <ProfileHeader suspect={suspect} />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left side: TABS for Reports, Evidence, Stats */}
        <div className="md:col-span-2">
          <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reports">
                Reports ({suspect.report_count})
              </TabsTrigger>
              <TabsTrigger value="evidence">
                Evidence ({suspect.evidence_count})
              </TabsTrigger>
              {/*TODO:// implement*/}
              {/*<TabsTrigger value="stats">Stats</TabsTrigger>*/}
            </TabsList>

            {/* REPORTS */}
            <TabsContent value="reports" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Flag className="mr-2 h-5 w-5 text-primary" />
                    Report History
                  </CardTitle>
                  <CardDescription>
                    This player has been reported {suspect.report_count} times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportsList reports={reports || []} />
                </CardContent>
                <CardFooter>
                  {!isProd() && (
                    <Button variant="outline" className="w-full">
                      <Flag className="mr-2 h-4 w-4" />
                      Submit New Report
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            {/* EVIDENCE */}
            <TabsContent value="evidence" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                    Evidence Submitted
                  </CardTitle>
                  <CardDescription>
                    {suspect.evidence_count} pieces of evidence have been
                    submitted
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EvidenceSection
                    profileId={suspect.id}
                    evidence={evidence || []}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* STATS */}
            {/*TODO:// implement this*/}
            {/*<TabsContent value="stats" className="mt-4">*/}
            {/*  <Card>*/}
            {/*    <CardHeader>*/}
            {/*      <CardTitle className="flex items-center">*/}
            {/*        <Clock className="mr-2 h-5 w-5 text-primary" />*/}
            {/*        Player Statistics*/}
            {/*      </CardTitle>*/}
            {/*      <CardDescription>*/}
            {/*        Game statistics and tracking data*/}
            {/*      </CardDescription>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent>*/}
            {/*      <ProfileStats profileId={id} />*/}
            {/*    </CardContent>*/}
            {/*  </Card>*/}
            {/*</TabsContent>*/}
          </Tabs>
        </div>

        {/* Right side: SteamProfileCard, CheaterStatusBar, RelatedProfilesCard, etc. */}
        <div className="space-y-6">
          <SteamProfileCard
            steam_id_64={suspect.steam_id_64}
            steam_id_32={suspect.steam_id_32}
            steam_url={suspect.steam_url}
            firstReported={suspect.created_at}
            banStatus={suspect.ban_status ?? false}
            suspiciousScore={suspect.suspicious_score ?? 0}
            cheater={suspect.cheater ?? false}
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
              <CheaterStatusBar
                suspiciousScore={suspect.suspicious_score ?? 0}
              />
            </CardContent>
          </Card>

          {suspect.related_profiles != null && (
            <RelatedProfilesCard relatedProfiles={suspect.related_profiles} />
          )}
        </div>
      </div>
    </div>
  );
}
