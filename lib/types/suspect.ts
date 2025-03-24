// types/suspect.ts

/**
 * Represents a single suspect profile in our system.
 */
export interface Suspect {
  id: string
  steam_name: string
  steam_id_64: string
  steam_url: string | null
  avatar_url: string | null
  ban_status: boolean | null
  report_count: number
}
