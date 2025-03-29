"use server";

import {fetchSupabase} from "@/lib/utils/supabase/helpers/supabase-fetch-helper";
import {enrichSuspect} from "@/app/profiles/actions";

/**
 * Fetches a user by profile ID or steam_id_64
 */
export async function getEnrichedUser(profileId: String) {
	try {
		if (!profileId) {
			throw new Error("You must provide either a profileId");
		}

		let query = `users?select=*&id=eq.${profileId}`;


		const response = await fetchSupabase({query, cache: "no-cache"});

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
