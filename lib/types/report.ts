export type CustomReport = {
  id: string;
  profile_id: string;
  user_id: string;
  reporter_ip_hash: string;
  reported_at: string;
};

type ReportProfile = {
  id: string;
  steam_id_64: string;
  steam_url: string | null;
};

export interface Report {
  id: string;
  reporter_ip_hash: string;
  reported_at: string;
  profile: ReportProfile | null;
}
