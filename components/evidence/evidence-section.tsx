// EvidenceSection.tsx
// "use client";

import React from "react";
import { EvidenceItem } from "@/components/evidence/evidence-item";
import { Evidence } from "@/lib/types/evidence";

interface EvidenceSectionProps {
  evidence: Evidence[];
  profileId: string;
}

export function EvidenceSection({ evidence, profileId }: EvidenceSectionProps) {
  // const [showAddForm, setShowAddForm] = useState(false);
  // const [localEvidence, setLocalEvidence] = useState<Evidence[]>(evidence);

  // const handleVote = (evidenceId: string, voteType: "up" | "down") => {
  //   setLocalEvidence((prev) =>
  //     prev.map((item) =>
  //       item.id === evidenceId
  //         ? {
  //             ...item,
  //             up_votes: voteType === "up" ? item.up_votes + 1 : item.up_votes,
  //             down_votes:
  //               voteType === "down" ? item.down_votes + 1 : item.down_votes,
  //           }
  //         : item,
  //     ),
  //   );
  // };
  //
  // const handleAddEvidence = (url: string, description: string) => {
  //   const newEvidence: Evidence = {
  //     id: `ev-${Date.now()}`,
  //     evidence_type: "video",
  //     evidence_url: url,
  //     content: description,
  //     created_at: new Date().toISOString(),
  //     profile_id: "current-user",
  //     up_votes: 0,
  //     down_votes: 0,
  //   };
  //
  //   setLocalEvidence((prev) => [newEvidence, ...prev]);
  //   setShowAddForm(false);
  // };

  return (
    <div className="space-y-4">
      {evidence.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No evidence has been submitted yet.</p>
        </div>
      ) : (
        evidence.map((item) => (
          <EvidenceItem
            key={item.id}
            evidence={item}
            // onVote={() => console.log("asdasd")}
          />
        ))
      )}

      {/*  // TODO: rather use a shadcn modal to display this form here*/}
      {/*{!showAddForm ? (*/}
      {/*  <Button variant="outline" className="w-full">*/}
      {/*    Add Evidence*/}
      {/*  </Button>*/}
      {/*) : (*/}

      {/*  <EvidenceForm*/}
      {/*    onSubmit={handleAddEvidence}*/}
      {/*    onCancel={() => setShowAddForm(false)}*/}
      {/*  />*/}
      {/*)}*/}
    </div>
  );
}
