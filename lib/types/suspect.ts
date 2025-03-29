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
  report_count?: number;
  evidence_count?: number;
  comment_count?: number;
  suspicious_score: number;
  steam_summary: SteamSummary;
  ban_status: BanStatus;
}

export type BanStatus = {
  SteamId: string;
  CommunityBanned: boolean;
  VACBanned: boolean;
  NumberOfVACBans: number;
  DaysSinceLastBan: number;
  NumberOfGameBans: number;
  EconomyBan: string;
};

type SteamSummary = {
  steam_name: string;
  avatar_url: string;
  country_code: string;
};
