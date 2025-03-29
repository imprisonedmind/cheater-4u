"use server";
import { parseEvidenceFields } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/utils/supabase/server";

/**
 * Inserts a new row into the `evidence` table.
 * You can call this from anywhere, as long as you know the `profileId`
 * and the `steam_id_64`.
 */
export async function submitEvidenceAction(
  formData: FormData,
  args: { profileId: string; steam_id_64?: string; game?: string },
) {
  const supabase = await createClient();

  const { evidenceType, evidenceUrl, evidenceContent } =
    parseEvidenceFields(formData);

  // If the user provided no evidence fields, optionally skip
  if (!evidenceType) {
    return { success: false, message: "No evidence fields provided." };
  }

  const { profileId, steam_id_64, game } = args;

  // Insert a new `evidence` row
  const { error } = await supabase.from("evidence").insert({
    profile_id: profileId,
    steam_id_64: steam_id_64 ?? null, // optional
    evidence_type: evidenceType,
    evidence_url: evidenceUrl || null,
    content: evidenceContent || null,
    game: game || null, // ✅ write game field if provided
  });

  if (error) {
    console.error("submitEvidenceAction error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/profiles/${profileId}`);

  return { success: true };
}
