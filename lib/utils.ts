import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

  if (game && evidenceContent) {
    evidenceContent = `Game: ${game}\n${evidenceContent}`;
  }

  return { evidenceType, evidenceUrl, evidenceContent };
}
