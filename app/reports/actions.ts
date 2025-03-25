"use server"

import { revalidatePath } from "next/cache"
import { hashIP } from "@/lib/utils/hasIp"
import { getSteamIDsFromProfileUrl } from "@/lib/steam/steamApis"
import { createClient } from "@/lib/utils/supabase/server"

/**
 * Single server action that:
 * 1) Upserts the profile.
 * 2) Creates a row in `reports` with hashed IP.
 * 3) Calls `submitEvidenceAction` to store the provided evidence in `evidence` table.
 */
export async function submitProfileReportAction(formData: FormData) {
  try {
    const supabase = await createClient()

    // 1) Basic fields
    const steamUrl = formData.get("steam_url")?.toString() ?? ""
    // (Potentially other top-level fields if needed)

    // 2) Resolve steam IDs
    const { steam_id_64, steam_id_32 } = await getSteamIDsFromProfileUrl(steamUrl)

    // 3) Upsert into profiles
    const { data: upsertedProfile, error: profileError } = await supabase
        .from("profiles")
        .upsert(
            {
              steam_id_64,
              steam_id_32,
              steam_url: steamUrl
            },
            {
              onConflict: "steam_id_64",
              ignoreDuplicates: true
            }
        )
        .select()
        .single()

    let profileId: string | undefined
    if (!upsertedProfile && !profileError) {
      // conflict => fetch existing
      const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("steam_id_64", steam_id_64)
          .single()
      profileId = existingProfile?.id
    } else {
      if (profileError) throw profileError
      profileId = upsertedProfile?.id
    }

    if (!profileId) {
      throw new Error("Could not upsert profile.")
    }

    // 4) Insert into reports (hash IP).
    //    With server actions, we can't easily read real IP, so we do a placeholder:
    const fakeIp = "0.0.0.0"
    const hashedIp = await hashIP(fakeIp)

    const { error: reportError } = await supabase.from("reports").insert({
      profile_id: profileId,
      reporter_ip_hash: hashedIp
    })
    if (reportError) {
      throw reportError
    }

    // 5) Insert evidence by calling the standalone action
    //    (We pass `formData` and the IDs we just derived.)
    const evidenceResult = await submitEvidenceAction(formData, {
      profileId,
      steam_id_64
    })
    if (!evidenceResult.success) {
      throw new Error(evidenceResult.error ?? "Failed to insert evidence")
    }

    // 6) Revalidate path(s) if needed
    revalidatePath("/reports")

    return { success: true }
  } catch (err: any) {
    console.error("submitProfileReportAction error:", err)
    return { error: err.message ?? "Unknown error" }
  }
}


/**
 * Parse the relevant evidence fields from FormData.
 * You could also parse them inline if you prefer.
 */
function parseEvidenceFields(formData: FormData) {
  const videoUrl = formData.get("video_url")?.toString() ?? ""
  const videoDesc = formData.get("video_description")?.toString() ?? ""
  const screenshotUrl = formData.get("screenshot_url")?.toString() ?? ""
  const screenshotDesc = formData.get("screenshot_description")?.toString() ?? ""
  const detailedDesc = formData.get("detailed_description")?.toString() ?? ""
  const game = formData.get("game")?.toString() ?? ""

  let evidenceType = ""
  let evidenceUrl = ""
  let evidenceContent = ""

  if (videoUrl) {
    evidenceType = "video"
    evidenceUrl = videoUrl
    evidenceContent = videoDesc
  } else if (screenshotUrl) {
    evidenceType = "screenshot"
    evidenceUrl = screenshotUrl
    evidenceContent = screenshotDesc
  } else if (detailedDesc) {
    evidenceType = "description"
    evidenceUrl = ""
    evidenceContent = detailedDesc
  }

  if (game && evidenceContent) {
    evidenceContent = `Game: ${game}\n${evidenceContent}`
  }

  return { evidenceType, evidenceUrl, evidenceContent }
}

/**
 * Inserts a new row into the `evidence` table.
 * You can call this from anywhere, as long as you know the `profileId`
 * and the `steam_id_64`.
 */
export async function submitEvidenceAction(
    formData: FormData,
    args: { profileId: string; steam_id_64?: string }
) {
  const supabase = await createClient()

  const { evidenceType, evidenceUrl, evidenceContent } = parseEvidenceFields(formData)

  // If the user provided no evidence fields, optionally skip
  if (!evidenceType) {
    return { success: false, message: "No evidence fields provided." }
  }

  const { profileId, steam_id_64 } = args

  // Insert a new `evidence` row
  const { error } = await supabase.from("evidence").insert({
    profile_id: profileId,
    steam_id_64: steam_id_64 ?? null, // store same 64 ID in evidence if desired
    evidence_type: evidenceType,
    evidence_url: evidenceUrl || null,
    content: evidenceContent || null
  })

  if (error) {
    console.error("submitEvidenceAction error:", error)
    return { success: false, error: error.message }
  }

  // Optionally revalidate something
  revalidatePath(`/profiles/${profileId}`)

  return { success: true }
}
