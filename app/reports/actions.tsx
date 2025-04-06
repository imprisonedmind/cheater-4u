"use server";

import { fetchSupabase } from "@/lib/utils/supabase/helpers/supabase-fetch-helper";
import { getServerSession } from "@/lib/auth/get-server-session";
import {
  fetchSteamUserSummary,
  getSteamIDsFromProfileUrl,
} from "@/lib/steam/steamApis"; // Assuming this path is correct
import { hashIP } from "@/lib/utils/hasIp"; // Assuming this path is correct
import { createClient } from "@/lib/utils/supabase/server";
import { submitEvidenceAction } from "@/app/evidence/actions"; // Assuming this path is correct
import { revalidateTag } from "next/cache";

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

/**
 * Single server action that:
 * 1) Upserts the profile.
 * 2) Creates a row in `reports` with hashed IP.
 * 3) Calls `submitEvidenceAction` to store the provided evidence in `evidence` table.
 */
export async function submitProfileReportAction(formData: FormData) {
  console.log("DEBUG: submitProfileReportAction started"); // Log start
  try {
    const supabase = await createClient();

    const user = await getServerSession(); // You now have access to session
    // Ensure user object and relevant properties exist before accessing them
    const reporter_steam_id_64 = user?.steam_id_64;
    const reporter_user_id = user?.id; // Assuming your session user has an 'id' field

    if (!reporter_steam_id_64) {
      console.error(
        "DEBUG: Unauthorized - reporter_steam_id_64 missing from session",
      );
      throw new Error("Unauthorized: Missing user session or Steam ID.");
    }
    console.log(
      `DEBUG: Reporter Steam ID: ${reporter_steam_id_64}, User ID: ${reporter_user_id}`,
    );

    const steamUrl = formData.get("steam_url")?.toString();
    if (!steamUrl) {
      console.error("DEBUG: Missing Steam URL in form data");
      throw new Error("Missing Steam URL");
    }
    console.log(`DEBUG: Processing Steam URL: ${steamUrl}`);

    const { steam_id_64, steam_id_32 } =
      await getSteamIDsFromProfileUrl(steamUrl);
    console.log(
      `DEBUG: Resolved Steam IDs: 64=${steam_id_64}, 32=${steam_id_32}`,
    );

    const steamSummary = await fetchSteamUserSummary(steam_id_64);
    if (!steamSummary) {
      console.error(
        `DEBUG: Steam profile not found or private for ${steam_id_64}`,
      );
      throw new Error("Steam profile not found or is private");
    }
    console.log(`DEBUG: Fetched Steam summary for ${steam_id_64}`);

    const { data: upsertedProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          steam_id_64,
          steam_id_32,
          steam_url: `https://steamcommunity.com/profiles/${steam_id_64}`,
          // Consider adding steam_name, avatar_url, country_code from steamSummary here
          // steam_name: steamSummary.steam_name,
          // avatar_url: steamSummary.avatar_url,
          // country_code: steamSummary.country_code,
        },
        {
          onConflict: "steam_id_64", // this needs a UNIQUE constraint
        },
      )
      .select("id")
      .single(); // fails if no or multiple rows returned

    if (profileError) {
      console.error("DEBUG: Supabase profile upsert error:", profileError);
      throw profileError;
    }

    const profileId = upsertedProfile?.id;
    if (!profileId) {
      console.error(
        "DEBUG: Could not upsert or find profile after upsert call.",
      );
      throw new Error("Could not upsert or find profile.");
    }
    console.log(`DEBUG: Profile upserted/found. Profile ID: ${profileId}`);

    // TODO: Replace fake IP with actual user IP if needed/possible
    // const requestIp = headers().get('x-forwarded-for') ?? headers().get('x-real-ip'); // Example for Vercel/Next.js
    const fakeIp = "0.0.0.0"; // Replace with real IP if possible
    const reporter_ip_hash = await hashIP(fakeIp);
    console.log(`DEBUG: Reporter IP hash generated: ${reporter_ip_hash}`);

    const { error: reportError } = await supabase.from("reports").insert({
      profile_id: profileId,
      reporter_ip_hash,
      reporter_steam_id_64,
    });

    if (reportError) {
      console.error("DEBUG: Supabase report insert error:", reportError);
      throw reportError;
    }
    console.log(
      `DEBUG: Report inserted successfully for profile ID: ${profileId}`,
    );

    // --- Corrected Evidence Check ---
    const hasEvidence = [
      "video_url",
      "video_description",
      "screenshot_url",
      "screenshot_description",
      "detailed_description",
    ].some((field) => formData.get(field)?.toString().trim()); // Check if the value exists and is not just whitespace

    console.log("DEBUG: hasEvidence check result:", hasEvidence); // Add logging

    if (hasEvidence) {
      console.log(
        "DEBUG: Evidence found, preparing to call submitEvidenceAction",
      );
      const game = formData.get("game")?.toString() ?? "CS2";

      // Add logging for data being passed
      console.log("DEBUG: Passing to submitEvidenceAction:", {
        profileId,
        steam_id_64,
        game,
        userId: reporter_user_id, // Use the ID retrieved from session earlier
      });
      // Log the entire formData for deeper inspection if needed
      // console.log("DEBUG: FormData entries:", Object.fromEntries(formData.entries()));

      const result = await submitEvidenceAction(formData, {
        profileId,
        steam_id_64, // Pass steam_id_64 from profile lookup
        game,
        userId: reporter_user_id, // Pass the user's database ID if available in session
      });

      console.log("DEBUG: submitEvidenceAction result:", result); // Log result

      if (!result.success) {
        // Ensure this error propagates correctly and includes the reason
        console.error(
          "DEBUG: submitEvidenceAction failed:",
          result.error || result.message,
        );
        throw new Error(
          result.error || result.message || "Failed to insert evidence",
        );
      }
      console.log(
        `DEBUG: Evidence submitted successfully for profile ID: ${profileId}`,
      );
    } else {
      console.log(
        "DEBUG: No non-empty evidence fields found in form data. Skipping evidence submission.",
      );
    }

    // Revalidate necessary paths/tags
    revalidateTag("suspects"); // Assuming this tag exists and is useful
    // Consider also revalidating the specific profile page if needed:
    // revalidatePath(`/profiles/${profileId}`);

    console.log(
      `DEBUG: submitProfileReportAction completed successfully for profile ID: ${profileId}`,
    );
    return { profileId }; // Return the profileId on success
  } catch (err: any) {
    // Avoid logging NEXT_REDIRECT as an error if it's expected behavior
    if (err?.digest === "NEXT_REDIRECT") {
      console.log("[submitProfileReportAction] Caught NEXT_REDIRECT:", err);
      // Depending on your flow, you might want to return null or re-throw
      return null; // Or potentially throw err; if redirect should halt execution flow earlier
    }

    console.error("[submitProfileReportAction] Error caught:", err);
    // Rethrow a generic error or the specific message for the client
    throw new Error(
      err.message ??
        "An unexpected server error occurred during report submission.",
    );
  }
}

/**
 * Get the total report Count
 * */
export async function getReportCount(): Promise<number> {
  const query = "reports?select=id"; // Consider using count aggregate for efficiency: 'reports?select=count'
  const res = await fetchSupabase({ query });

  if (!res.ok) {
    console.error(`DEBUG: Failed to fetch report count. Status: ${res.status}`);
    throw new Error("Failed to fetch report count");
  }
  const data = await res.json();
  // If using count aggregate, the response structure is different:
  // const countData = await res.json(); return countData[0]?.count ?? 0;
  return data.length; // Current implementation counts rows client-side (less efficient for large tables)
}
