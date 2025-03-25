// EvidenceThumbnail.tsx
import React from "react";
import { getYouTubeVideoId } from "@/lib/utils";
import { Evidence } from "@/lib/types/evidence";

interface AllstarClipData {
  thumbnailUrl: string;
  embedUrl: string;
}

/**
 * Returns the YouTube embed URL if the link is a YouTube URL.
 */
const getYoutubeEmbedUrl = (url: string): string | null => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

/**
 * Interrogates an Allstar.gg clip URL and returns both the thumbnail and embed URLs.
 * Standard clip URL example: https://allstar.gg/clip/67d3b8a5b78ea80eb5829f26
 * Thumbnail URL example: https://mediacdn.allstar.gg/655bdb1a94c4ae53019032e6/thumbs/67d3b8a5b78ea80eb5829f26_thumb.jpg
 * Embed URL example: https://allstar.gg/iframe?clip=67d3b8a5b78ea80eb5829f26&autoplay=false
 */
const getAllstarClipData = (url: string): AllstarClipData | null => {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "clip" && pathParts[1]) {
      const clipId = pathParts[1];
      const thumbnailUrl = `https://mediacdn.allstar.gg/655bdb1a94c4ae53019032e6/thumbs/${clipId}_thumb.jpg`;
      const embedUrl = `https://allstar.gg/iframe?clip=${clipId}&autoplay=false`;
      return { thumbnailUrl, embedUrl };
    }
  } catch (error) {
    console.error("Error parsing Allstar clip URL:", error);
  }
  return null;
};

/**
 * Returns a Twitter embed URL via a service like Twitframe.
 */
const getTwitterEmbedUrl = (url: string): string | null => {
  if (url.includes("twitter.com")) {
    return `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
  }
  return null;
};

/**
 * Returns the Streamable embed URL.
 */
const getStreamableEmbedUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("streamable.com")) {
      const parts = parsedUrl.pathname.split("/").filter(Boolean);
      let videoId = "";
      if (parts[0] === "e" && parts[1]) {
        videoId = parts[1];
      } else if (parts[0]) {
        videoId = parts[0];
      }
      if (videoId) {
        return `https://streamable.com/e/${videoId}`;
      }
    }
  } catch (error) {
    console.error("Error parsing Streamable URL:", error);
  }
  return null;
};

/**
 * EvidenceThumbnail component that uses an iframe to embed videos.
 * For video evidence, it checks for YouTube, Allstar.gg, Twitter, and Streamable sources.
 * For Allstar.gg clips, it uses the getAllstarClipData helper to build the embed and thumbnail URLs.
 */
export const EvidenceThumbnail = ({ evidence }: { evidence: Evidence }) => {
  if (evidence.evidence_type === "video") {
    const youtubeEmbed = getYoutubeEmbedUrl(evidence.evidence_url);
    if (youtubeEmbed) {
      return (
        <div className="relative aspect-video bg-black rounded-md overflow-hidden">
          <iframe
            src={youtubeEmbed}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              left: 0,
              top: 0,
              overflow: "hidden",
            }}
          ></iframe>
        </div>
      );
    }

    const allstarData = getAllstarClipData(evidence.evidence_url);
    if (allstarData) {
      return (
        <div className="relative aspect-video bg-black rounded-md overflow-hidden">
          <iframe
            src={allstarData.embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              left: 0,
              top: 0,
              overflow: "hidden",
            }}
          ></iframe>
        </div>
      );
    }

    const twitterEmbed = getTwitterEmbedUrl(evidence.evidence_url);
    if (twitterEmbed) {
      return (
        <div className="relative aspect-video bg-black rounded-md overflow-hidden">
          <iframe
            src={twitterEmbed}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              left: 0,
              top: 0,
              overflow: "hidden",
            }}
          ></iframe>
        </div>
      );
    }

    const streamableEmbed = getStreamableEmbedUrl(evidence.evidence_url);
    if (streamableEmbed) {
      return (
        <div className="relative aspect-video bg-black rounded-md overflow-hidden">
          <iframe
            src={streamableEmbed}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              left: 0,
              top: 0,
              overflow: "hidden",
            }}
          ></iframe>
        </div>
      );
    }

    // Fallback: if no embed URL is determined, show a generic thumbnail image.
    return (
      <a href={evidence.evidence_url} target="_blank" rel="noopener noreferrer">
        <img src="/png/mp4.png" alt="Video thumbnail" className="rounded-md" />
      </a>
    );
  } else if (evidence.evidence_type === "screenshot") {
    return (
      <a href={evidence.evidence_url} target="_blank" rel="noopener noreferrer">
        <img
          src={evidence.evidence_url}
          alt="Image evidence"
          className="rounded-md"
        />
      </a>
    );
  }
  return null;
};
