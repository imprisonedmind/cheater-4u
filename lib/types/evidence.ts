export type Evidence = {
  id: string;
  profile_id: string;
  evidence_type: string;
  evidence_url: string | null;
  content: string | null;
  created_at: string;
  up_votes: number;
  down_votes: number;
};
