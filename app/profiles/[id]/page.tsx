import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/utils/supabase/server"
import { Flag, ExternalLink, ArrowLeft, MessageSquare, Video } from "lucide-react"
import { EvidenceSection } from "@/components/evidence/evidence-section"
import { CommentSection } from "@/components/comments/comment-section"

interface ProfilePageProps {
  params: Promise<{
    id: string
  }>
}


export default async function ProfilePage({ params }: ProfilePageProps) {
  // In Next.js 15, we need to await the params object
  const { id } = await params

  let profile = null
  let error = null

  try {
    // Try to fetch from Supabase if available
    const supabase = await createClient()
    const result = await supabase
        .from("profiles")
        .select(`
        id,
        steam_id_32,
        steam_id_64,
        steam_url,
        created_at,
        updated_at,
        reports (
          id,
          reporter_ip_hash,
          reported_at
        ),
        evidence (
          id,
          evidence_type,
          evidence_url,
          content,
          created_at,
          user_id,
          upvotes,
          downvotes
        ),
        comments (
          id,
          content,
          created_at,
          user_id
        )
      `)
        .eq("id", id)
        .single()

    profile = result.data
    error = result.error
  } catch (e) {
    // Supabase might not be available in development
    console.error("Error fetching from Supabase:", e)
  }

  // If no profile found or error, use mock data
  if (!profile || error) {
    // Use mock data for demonstration
    if (id === "mock-1" || id === "1") {
      profile = {
        id: id,
        steam_id_32: "STEAM_0:1:12345678",
        steam_id_64: "76561198012345678",
        steam_url: "https://steamcommunity.com/profiles/76561198012345678",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reports: [
          {
            id: "rep-1",
            reporter_ip_hash: "127.0.0.1-hash",
            reported_at: new Date().toISOString(),
          },
          {
            id: "rep-2",
            reporter_ip_hash: "192.168.1.1-hash",
            reported_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          },
        ],
        evidence: [],
        comments: [],
      }
    } else {
      // If not even our mock ID, return 404
      notFound()
    }
  }

  // Mock data for demonstration - in production, you'd use real data from Supabase
  const profileData = {
    ...profile,
    steam_name: "Suspected_Player123", // This would come from Steam API or be stored in your DB
    avatar_url: "/placeholder.svg?height=128&width=128",
    ban_status: false,
    last_seen: new Date().toISOString(),
    report_count: profile.reports?.length || 0,
    evidence_count: profile.evidence?.length || 0,
    comment_count: profile.comments?.length || 0,
    first_reported: profile.created_at,
  }

  // Mock evidence data if none exists
  const evidenceData =
      profile.evidence?.length > 0
          ? profile.evidence
          : [
            {
              id: "ev-1",
              evidence_type: "video",
              evidence_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              content: "Clear aimbot at 1:45 in the video. Notice how the crosshair snaps to heads through walls.",
              created_at: new Date().toISOString(),
              user_id: "user-1",
              upvotes: 24,
              downvotes: 3,
            },
            {
              id: "ev-2",
              evidence_type: "video",
              evidence_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              content: "Spinbot and wallhacks throughout the entire match. Very blatant cheating.",
              created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              user_id: "user-2",
              upvotes: 18,
              downvotes: 1,
            },
          ]

  // Mock comments data if none exists
  const commentsData =
      profile.comments?.length > 0
          ? profile.comments
          : [
            {
              id: "cm-1",
              content: "I played against this guy yesterday. Definitely using some kind of aim assistance.",
              created_at: new Date().toISOString(),
              user_id: "user-3",
            },
            {
              id: "cm-2",
              content: "He's been banned on FACEIT already, just waiting for VAC to catch up.",
              created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              user_id: "user-4",
            },
            {
              id: "cm-3",
              content: "I've analyzed the demo and it's pretty obvious. The tracking through walls is inhuman.",
              created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
              user_id: "user-5",
            },
          ]

  return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <Link href="/users" className="btn btn-ghost btn-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profiles
          </Link>
        </div>

        {/* Profile Header */}
        <div className="card overflow-hidden">
          <div className="h-32 bg-secondary relative">
            <div className="absolute inset-0 bg-grid-white\/5"></div>
          </div>
          <div className="p-6 flex flex-col md:flex-row gap-6 -mt-12">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full border-4 border-background bg-card overflow-hidden">
                {profileData.avatar_url ? (
                    <img
                        src={profileData.avatar_url || "/placeholder.svg"}
                        alt={profileData.steam_name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-secondary text-secondary-foreground text-2xl font-bold">
                      {profileData.steam_name.charAt(0).toUpperCase()}
                    </div>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-2xl font-bold">{profileData.steam_name}</h1>
                {profileData.ban_status ? (
                    <span className="badge badge-destructive">Banned</span>
                ) : (
                    <span className="badge badge-secondary">Active</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-mono">{profileData.steam_id_64}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Flag className="mr-1 h-4 w-4 text-destructive" />
                {profileData.report_count} reports
              </span>
                <span className="flex items-center">
                <Video className="mr-1 h-4 w-4 text-primary" />
                  {profileData.evidence_count} evidence
              </span>
                <span className="flex items-center">
                <MessageSquare className="mr-1 h-4 w-4" />
                  {profileData.comment_count} comments
              </span>
              </div>
            </div>
            <div className="flex flex-row md:flex-col gap-2 self-start mt-4 md:mt-0">
              <button className="btn btn-primary btn-sm">
                <Flag className="mr-2 h-4 w-4" />
                Report
              </button>
              <button className="btn btn-outline btn-sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Evidence Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <Video className="mr-2 h-5 w-5 text-primary" />
                  Evidence
                </h2>
                <p className="card-description">Video evidence of suspicious behavior</p>
              </div>
              <div className="card-content">
                <EvidenceSection evidence={evidenceData} profileId={id} />
              </div>
            </div>

            {/* Comments Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Comments
                </h2>
                <p className="card-description">Discussion about this player</p>
              </div>
              <div className="card-content">
                <CommentSection comments={commentsData} profileId={id} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Steam Profile</h2>
              </div>
              <div className="card-content space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Steam ID 64</p>
                  <p className="font-mono text-xs text-muted-foreground break-all">{profileData.steam_id_64}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Steam ID 32</p>
                  <p className="font-mono text-xs text-muted-foreground break-all">{profileData.steam_id_32}</p>
                </div>
                {profileData.steam_url && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Steam URL</p>
                      <p className="text-xs text-muted-foreground break-all">
                        <a
                            href={profileData.steam_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:text-primary"
                        >
                          {profileData.steam_url}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </p>
                    </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium">First Reported</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(profileData.first_reported).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <div>
                    {profileData.ban_status ? (
                        <span className="badge badge-destructive">Banned</span>
                    ) : (
                        <span className="badge badge-secondary">Active</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <a
                    href={profileData.steam_url || `https://steamcommunity.com/profiles/${profileData.steam_id_64}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Steam
                </a>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Related Profiles</h2>
                <p className="card-description">Players frequently seen with this account</p>
              </div>
              <div className="card-content">
                <p className="text-sm text-muted-foreground">No related profiles found yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

