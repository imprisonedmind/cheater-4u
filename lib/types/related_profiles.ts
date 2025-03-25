export type RelatedProfileIdentifier = {
  profile_id?: string;
  steam_id_64?: string;
  steam_id?: string;
};

export interface RelatedProfileData {
  avatar_url: string;
  name: string;
  link: string;
}
