import { Shield } from "lucide-react";
import { getReportCount, getReports } from "@/app/reports/actions";
import { getEvidenceCount } from "@/app/evidence/actions";

export default async function MiddleSection() {
  const [reportCount, evidenceCount] = await Promise.all([
    getReportCount(),
    getEvidenceCount(),
  ]);

  const confidenceScore = Math.min(100, Math.floor(reportCount * 5));
  const verificationRate = Math.min(100, Math.floor(evidenceCount / 2));

  return (
    <div className="rounded-lg bg-black/40 backdrop-blur-sm border border-zinc-800 overflow-hidden col-span-2">
      <div className="grid grid-cols-2 gap-6 p-6">
        <div className="flex flex-col">
          {/* Tag label */}
          <div className="bg-black/60 rounded-lg px-4 py-2 inline-flex items-center self-start mb-4">
            <Shield className="h-5 w-5 mr-2 text-zinc-400" />
            <span>Investigation</span>
          </div>

          {/* Unique IP indicator */}
          <div className="flex justify-between items-end mt-auto mb-6">
            <div className="text-3xl font-bold text-orange-400 ml-auto">
              {reportCount} Total Reports
            </div>
          </div>

          {/* Visual trust line */}
          <div className="h-1 bg-gradient-to-r from-zinc-600 via-orange-400 to-orange-400 rounded-full mb-8"></div>

          <h3 className="text-xl font-semibold mb-2">
            Community-Sourced Evidence
          </h3>
          <p className="text-zinc-400 text-sm">
            Each report is verified via hashed IP tracking and cross-checked
            evidence like video clips, match links, and public comments. Our
            goal is to avoid false positives by relying on consistent,
            trustworthy submissions before a cheater label is applied.
          </p>
        </div>

        {/* Confidence Score Box */}
        <div className="bg-black/60 rounded-xl p-6 flex flex-col border border-zinc-800">
          <div className="text-3xl font-bold italic text-orange-400 self-end mb-2">
            S
          </div>

          <h3 className="text-xl font-semibold mb-4">Confidence Score</h3>

          {/* Evidence count */}
          <div className="mb-4">
            <div className="text-xs text-zinc-400 mb-1">Evidence Submitted</div>
            <div className="flex items-center">
              <span className="mr-1">🎥</span>
              <span className="text-lg font-medium">{evidenceCount}</span>
            </div>
          </div>

          {/* Confidence score */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div className="text-xs text-zinc-400">Confidence Level</div>
              <div className="text-right text-base font-semibold">
                {confidenceScore}%
              </div>
            </div>

            <div className="relative mt-2 mb-6">
              <div className="h-1 bg-gradient-to-r from-zinc-600 to-orange-400 rounded-full"></div>
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-orange-400 rounded-full"
                style={{ left: `${confidenceScore}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="h-px bg-zinc-800 my-4"></div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span>Accuracy Estimate</span>
                <span className="ml-2 px-2 py-0.5 bg-zinc-800 text-xs rounded-full">
                  98%
                </span>
              </div>
              <span className="text-orange-400">Auto-flag Enabled</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span>Verification Rate</span>
                <span className="ml-2 px-2 py-0.5 bg-zinc-800 text-xs rounded-full">
                  {verificationRate}%
                </span>
              </div>
              <span className="text-orange-400">Manual Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
