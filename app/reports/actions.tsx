"use server";

import { Report } from "@/lib/types/report";
import { fetchSupabase } from "@/lib/utils/supabase/helpers/supabase-fetch-helper";

export async function getReports() {
  // Build the query string using Supabase's PostgREST syntax.
  // Note: ordering descending is achieved with `order=reported_at.desc`
  const query =
    "reports?select=id,reporter_ip_hash,reported_at,profile:profile_id(id,steam_id_64,steam_url)&order=reported_at.desc";

  const response = await fetchSupabase({ query });
  if (!response.ok) {
    throw new Error("Failed to fetch reports");
  }

  return await response.json();
}
