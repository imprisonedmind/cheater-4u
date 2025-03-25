import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {ExternalLink, MessageSquare, Video} from "lucide-react"
import Link from "next/link"

interface Evidence {
  id: string
  evidence_type: string
  evidence_url: string | null
  content: string | null
  created_at: string
  user_id: string | null
}

interface EvidenceListProps {
  evidence: Evidence[]
}

export function EvidenceList({evidence}: EvidenceListProps) {
  // Sort evidence by date (newest first)
  const sortedEvidence = [...evidence].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  if (sortedEvidence.length === 0) {
    return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No evidence has been submitted yet.</p>
        </div>
    )
  }

  return (
      <div className="space-y-4">
        {sortedEvidence.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    {item.evidence_type === "video" && <Video className="h-4 w-4 mr-2 text-primary"/>}
                    {item.evidence_type === "comment" && <MessageSquare className="h-4 w-4 mr-2 text-primary"/>}
                    <Badge variant="outline">
                      {item.evidence_type.charAt(0).toUpperCase() + item.evidence_type.slice(1)}
                    </Badge>
                  </div>
                  <span
                      className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                {item.content && (
                    <div className="mt-2 text-sm">
                      <p>{item.content}</p>
                    </div>
                )}

                {item.evidence_url && (
                    <div className="mt-2">
                      {item.evidence_type === "video" ? (
                          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                            <Link
                                href={item.evidence_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-primary hover:underline"
                            >
                              <Video className="h-8 w-8 mr-2 opacity-70"/>
                              <span>View Video Evidence</span>
                              <ExternalLink className="ml-1 h-3 w-3"/>
                            </Link>
                          </div>
                      ) : (
                          <Link
                              href={item.evidence_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:underline text-sm"
                          >
                            <ExternalLink className="mr-1 h-3 w-3"/>
                            <span>{item.evidence_url}</span>
                          </Link>
                      )}
                    </div>
                )}

                <div className="mt-3 text-xs text-muted-foreground">
                  Submitted by: {item.user_id ? `User ${item.user_id.substring(0, 8)}...` : "Anonymous"}
                </div>
              </CardContent>
            </Card>
        ))}
      </div>
  )
}

