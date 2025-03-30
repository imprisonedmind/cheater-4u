"use server";

import {
  fetchSupabase,
  mutateSupabase,
} from "@/lib/utils/supabase/helpers/supabase-fetch-helper";
import { enrichSuspect } from "@/app/profiles/actions";
import { getServerSession } from "@/lib/auth/get-server-session";
import { isAuthoritative } from "@/lib/utils";
import { revalidateTag } from "next/cache";

/**
 * Fetches a user by profile ID or steam_id_64
 */
export async function getEnrichedUser(profileId: String) {
  try {
    if (!profileId) {
      throw new Error("You must provide either a profileId");
    }

    let query = `users?select=*&id=eq.${profileId}`;

    const response = await fetchSupabase({
      query,
      cache: "no-cache",
      tags: [`profile-${profileId}`],
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || "Failed to fetch user");
    }

    const data = await response.json();

    if (!data.length) {
      return null;
    }

    return await enrichSuspect(data[0]);
  } catch (error) {
    console.error("[getEnrichedUser] Failed:", error);
    throw error;
  }
}

/**
 * Toggle the column of CHEATER in the profiles column
 * */
export async function toggleCheaterStatus(profileId: string, cheater: boolean) {
  const user = await getServerSession();

  if (!isAuthoritative(user)) {
    throw new Error("Unauthorized");
  }

  const query = `profiles?id=eq.${profileId}`;
  const body = { cheater };
  const method = "PATCH";

  revalidateTag(`profile-${profileId}`);
  return await mutateSupabase({
    method,
    query,
    body,
    prefer: "return=representation",
  });
}
