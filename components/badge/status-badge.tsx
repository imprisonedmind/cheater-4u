import { Badge } from "@/components/ui/badge";

export function getStatusBadge({
  isCheater,
  ban_status,
  suspicious_score,
}: {
  isCheater: boolean;
  ban_status: boolean;
  suspicious_score: number;
}) {
  if (isCheater) {
    return <Badge variant="warning">Cheater</Badge>;
  }
  if (ban_status) {
    return <Badge variant="banned">Banned</Badge>;
  }
  if (suspicious_score >= 70) {
    return <Badge variant="outline">Suspicious</Badge>;
  }
  return <Badge variant="secondary">Active</Badge>;
}
