import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BanStatus } from "@/lib/types/suspect";
import { SessionUser } from "@/lib/auth/session";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Parse the relevant evidence fields from FormData.
 * You could also parse them inline if you prefer.
 */
export function parseEvidenceFields(formData: FormData) {
  const videoUrl = formData.get("video_url")?.toString() ?? "";
  const videoDesc = formData.get("video_description")?.toString() ?? "";
  const screenshotUrl = formData.get("screenshot_url")?.toString() ?? "";
  const screenshotDesc =
    formData.get("screenshot_description")?.toString() ?? "";
  const detailedDesc = formData.get("detailed_description")?.toString() ?? "";
  const game = formData.get("game")?.toString() ?? "";

  let evidenceType = "";
  let evidenceUrl = "";
  let evidenceContent = "";

  if (videoUrl) {
    evidenceType = "video";
    evidenceUrl = videoUrl;
    evidenceContent = videoDesc;
  } else if (screenshotUrl) {
    evidenceType = "screenshot";
    evidenceUrl = screenshotUrl;
    evidenceContent = screenshotDesc;
  } else if (detailedDesc) {
    evidenceType = "description";
    evidenceUrl = "";
    evidenceContent = detailedDesc;
  }

  return { evidenceType, evidenceUrl, evidenceContent };
}

/**
 * This works out whether the user has any sort of ban
 * */
export function isBanned(banStatus: BanStatus | null | undefined): boolean {
  if (!banStatus) return false;

  if (banStatus.CommunityBanned) return true;
  if (banStatus.VACBanned) return true;
  if (banStatus.NumberOfVACBans > 0) return true;
  if (banStatus.NumberOfGameBans > 0) return true;
  if (banStatus.DaysSinceLastBan > 0) return true;
  return banStatus.EconomyBan.toLowerCase() !== "none";
}

/**
 * Calculates a suspicious score based on multiple factors:
 * - Newer accounts are more suspicious.
 * - Any bans add a high penalty.
 * - A private account (heuristic: missing or flagged steam_url) adds penalty.
 * - A cheater flag from our DB increases the score.
 * - Each report or evidence adds a small amount.
 *
 * You can adjust the weight for each factor as needed.
 */
export function calculateSuspiciousScore(suspect: any): number {
  let score = 0;

  // Account Age: Newer accounts are often more suspicious.
  if (suspect.created_at) {
    const created = new Date(suspect.created_at);
    const daysOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 30) {
      score += 10;
    } else if (daysOld < 180) {
      score += 5;
    }
  } else {
    // No creation date? That’s a bit fishy.
    score += 5;
  }

  // Ban Status: Any ban flags a high suspicion.
  if (isBanned(suspect.ban_status)) {
    score += 50;
  }

  // Private Profile: Heuristically check if the account is private.
  // This example assumes a private account may have an empty or flagged steam_url.
  if (
    !suspect.steam_url ||
    suspect.steam_url.toLowerCase().includes("private")
  ) {
    score += 20;
  }

  // Cheater Flag: If flagged as a cheater in our DB.
  if (suspect.cheater) {
    score += 30;
  }

  // Reports and Evidence: Each report/evidence adds to the score.
  if (suspect.report_count) {
    score += suspect.report_count * 5;
  }
  if (suspect.evidence_count) {
    score += suspect.evidence_count * 5;
  }

  return score;
}

/**
 * Cache revalidation time for all queries at the moment
 * */
export const revalidate_time = 1800;

/**
 * Helper to let us know if someone is acutally logged in
 * */
export function isLoggedIn(user: Partial<SessionUser>): user is SessionUser {
  return Boolean(user?.steam_id_64);
}

/**
 * Helper to let us know if someone is actually Authoritative
 * */
export function isAuthoritative(
  user: { role?: string } | null | undefined,
): boolean {
  if (!user || !user.role) return false;
  return user.role === "admin" || user.role === "mod";
}
