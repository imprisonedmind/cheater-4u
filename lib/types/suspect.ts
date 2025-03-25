export interface Suspect {
  id: string
  steam_id_64?: string
  steam_id_32?: string
  steam_url?: string

  // Columns that might be in your DB
  cheater?: boolean
  created_at?: string
  updated_at?: string

  // Enriched fields:
  steam_name?: string
  avatar_url?: string
  ban_status?: boolean
  report_count?: number
  evidence_count?: number
  suspicious_score?: number
}
