import { RelatedProfileIdentifier } from "@/lib/types/related_profiles";

export interface Suspect {
  id: string;
  steam_id_64: string;
  steam_id_32: string;
  steam_url: string;
  created_at?: string;

  // Columns that might be in your DB
  related_profiles?: RelatedProfileIdentifier[];
  cheater?: boolean;
  updated_at?: string;

  // Enriched fields:
  steam_name?: string;
  avatar_url?: string;
  ban_status?: boolean;
  report_count?: number;
  evidence_count?: number;
  suspicious_score?: number;
}
