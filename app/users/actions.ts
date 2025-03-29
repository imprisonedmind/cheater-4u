"use server";
import { fetchSupabase } from "@/lib/utils/supabase/helpers/supabase-fetch-helper";
import { Suspect } from "@/lib/types/suspect";
import { enrichSuspect } from "@/app/profiles/actions";

/**
 * Fetches a user
 *
 * */
export async function getEnrichedUser(profileId: String) {
  try {
    // Filter profiles by the given profileId
    const query = `users?select=*&id=eq.${profileId}`;
    const response = await fetchSupabase({ query, cache: "no-cache" });
    const data = await response.json();

    return await enrichSuspect(data[0]);
  } catch (error) {
    throw error;
  }
}
