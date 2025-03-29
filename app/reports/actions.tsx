"use server";

import { fetchSupabase } from "@/lib/utils/supabase/helpers/supabase-fetch-helper";
import { getServerSession } from "@/lib/auth/get-server-session";
import {
  fetchSteamUserSummary,
  getSteamIDsFromProfileUrl,
} from "@/lib/steam/steamApis";
import { hashIP } from "@/lib/utils/hasIp";
import { createClient } from "@/lib/utils/supabase/server";
import { submitEvidenceAction } from "@/app/evidence/actions";

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
  try {
    const supabase = await createClient();

    const user = await getServerSession(); // You now have access to session
    const reporter_steam_id_64 = user?.steam_id_64;
    if (!reporter_steam_id_64) throw new Error("Unauthorized");

    const steamUrl = formData.get("steam_url")?.toString();
    if (!steamUrl) throw new Error("Missing Steam URL");

    const { steam_id_64, steam_id_32 } =
      await getSteamIDsFromProfileUrl(steamUrl);

    const steamSummary = await fetchSteamUserSummary(steam_id_64);
    if (!steamSummary) throw new Error("Steam profile not found or is private");

    const { data: upsertedProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          steam_id_64,
          steam_id_32,
          steam_url: `https://steamcommunity.com/profiles/${steam_id_64}`,
        },
        { onConflict: "steam_id_64", ignoreDuplicates: true },
      )
      .select("id")
      .single();

    if (profileError) throw profileError;

    const profileId = upsertedProfile?.id;
    if (!profileId) throw new Error("Could not upsert or find profile.");

    const fakeIp = "0.0.0.0"; // Replace with real IP if possible
    const reporter_ip_hash = await hashIP(fakeIp);

    const { error: reportError } = await supabase.from("reports").insert({
      profile_id: profileId,
      reporter_ip_hash,
      reporter_steam_id_64,
    });

    if (reportError) throw reportError;

    const hasEvidence = [
      "evidence_type",
      "evidence_url",
      "comments",
      "leetify_link",
      "video_url",
    ].some((field) => formData.get(field));

    if (hasEvidence) {
      const game = formData.get("game")?.toString() ?? "CS2"; // ✅ extract game

      const result = await submitEvidenceAction(formData, {
        profileId,
        steam_id_64,
        game,
      });

      if (!result.success) {
        throw new Error(result.error ?? "Failed to insert evidence");
      }
    }

    return { profileId };
  } catch (err: any) {
    if (err?.digest === "NEXT_REDIRECT") {
      console.error("[submitProfileReportAction] Redirect:", err);
      return null;
    }

    console.error("[submitProfileReportAction]", err);
    throw new Error(err.message ?? "Unexpected server error");
  }
}
