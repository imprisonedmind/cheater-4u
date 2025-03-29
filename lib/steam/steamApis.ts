// lib/steamApi.ts
"use server";
import { STEAM32_OFFSET } from "@/lib/constants";
import { revalidate_time } from "@/lib/utils";
import {SteamSummary} from "@/lib/types/suspect";

const apiKey = process.env.STEAM_API_KEY; // or process.env.STEAM_API_KEY

/**
 * Attempt to extract a 64-bit Steam ID from a URL *and* verify that the URL is actually accessible.
 * - If the URL is a "profiles/7656119..." link, parse out the numeric portion directly.
 * - If the URL is an "id/someVanity" link, we call Steam's ResolveVanityURL to get the real ID.
 * - If the URL is unreachable, throw an error immediately.
 *
 * Returns { steam_id_64, steam_id_32 }, or throws an error if we cannot resolve.
 */
export async function getSteamIDsFromProfileUrl(
  steamProfileUrl: string,
): Promise<{ steam_id_64: string; steam_id_32: string }> {
  const url = steamProfileUrl.trim();

  if (!url.toLowerCase().startsWith("http")) {
    throw new Error("Invalid Steam URL provided (must start with http/https).");
  }

  // 1. Check URL accessibility
  const res = await fetch(url, { method: "HEAD" });
  if (!res.ok) {
    throw new Error("Provided Steam Profile URL is not accessible.");
  }

  const lowerUrl = url.toLowerCase();

  // 2. Direct numeric URL parsing
  const profilesMatch = lowerUrl.match(/steamcommunity\.com\/profiles\/(\d+)/);
  if (profilesMatch) {
    const steam64 = profilesMatch[1];
    const steam32 = convert64to32(steam64);
    return { steam_id_64: steam64, steam_id_32: steam32 };
  }

  // 3. Vanity URL resolution via Steam API
  const vanityMatch = lowerUrl.match(/steamcommunity\.com\/id\/([^/]+)/);
  if (vanityMatch) {
    const vanityName = vanityMatch[1];
    const steam64 = await resolveVanityURL(vanityName); // should throw on failure
    if (!steam64) {
      throw new Error("Steam API did not return a valid Steam ID.");
    }
    const steam32 = convert64to32(steam64);
    return { steam_id_64: steam64, steam_id_32: steam32 };
  }

  throw new Error("Unable to parse Steam ID from URL. Unsupported format.");
}

/**
 * Convert a 64-bit Steam ID to 32-bit by subtracting the well-known offset.
 * For most accounts, steamID32 = steamID64 - 76561197960265728.
 */
function convert64to32(steam64: string): string {
  const bigVal = BigInt(steam64);
  const offset = BigInt(STEAM32_OFFSET); // e.g. 76561197960265728
  return (bigVal - offset).toString();
}

/**
 * Call Steam's ResolveVanityURL endpoint to convert a vanity name into a 64-bit ID.
 * https://partner.steamgames.com/doc/webapi/ISteamUser#ResolveVanityURL
 */
export async function resolveVanityURL(vanityName: string): Promise<string> {
  const apiKey = process.env.STEAM_API_KEY;
  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${vanityName}`,
    {
      cache: "force-cache",
      next: {
        revalidate: revalidate_time,
      },
    },
  );
  const data = await res.json();

  if (!res.ok || data.response.success !== 1) {
    throw new Error("Steam API failed to resolve vanity URL.");
  }

  return data.response.steamid;
}

/**
 * Basic call to the Steam "GetPlayerSummaries" endpoint to get name, avatar, etc.
 * https://steamcommunity.com/dev
 */
export async function fetchSteamUserSummary(steamId64: string) {
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId64}`;

  const res = await fetch(url, {
    cache: "force-cache",
    next: {
      revalidate: revalidate_time,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch player summary: ${res.statusText}`);
  }

  const data = await res.json();
  const players = data?.response?.players ?? [];
  if (players.length === 0) {
    return null;
  }

  // We’ll return just a subset of fields
  const { personaname, avatarfull, loccountrycode } = players[0];

  return {
    steam_name: personaname as string,
    avatar_url: avatarfull as string,
    country_code: loccountrycode as string,
  } as SteamSummary;
}

/**
 * Basic call to "GetPlayerBans" to see if there's a VAC or game ban.
 * https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/
 */
export async function fetchSteamBans(steamId64: string) {
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${steamId64}`;

  const res = await fetch(url, {
    cache: "force-cache",
    next: {
      revalidate: revalidate_time,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch player bans: ${res.statusText}`);
  }

  const data = await res.json();
  const players = data?.players ?? [];
  if (players.length === 0) {
    return null;
  }

  return players[0];
}
