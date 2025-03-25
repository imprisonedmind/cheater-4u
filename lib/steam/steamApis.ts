// lib/steamApi.ts
import { STEAM32_OFFSET } from "@/lib/constants"; // define offset somewhere
const apiKey = process.env.STEAM_API_KEY; // or process.env.STEAM_API_KEY

/**
 * Attempt to extract a 64-bit Steam ID from a URL.
 * - If the URL is a "profiles/7656119..." link, we parse out the numeric portion directly.
 * - If the URL is an "id/someVanity" link, we call Steam's ResolveVanityURL to get the real ID.
 *
 * Returns { steam_id_64, steam_id_32 }, or throws an error if we cannot resolve.
 */
export async function getSteamIDsFromProfileUrl(
  steamProfileUrl: string,
): Promise<{
  steam_id_64: string;
  steam_id_32: string;
}> {
  // Clean up whitespace, etc.
  const url = steamProfileUrl.trim().toLowerCase();

  if (!url.startsWith("http")) {
    throw new Error("Invalid Steam URL provided.");
  }

  // Some quick pattern checks:
  // 1. Numeric "profiles" link: https://steamcommunity.com/profiles/7656119xxxx
  const profilesMatch = url.match(/steamcommunity\.com\/profiles\/(\d+)/);
  if (profilesMatch) {
    const steam64 = profilesMatch[1]; // the numeric portion
    const steam32 = convert64to32(steam64);
    return {
      steam_id_64: steam64,
      steam_id_32: steam32,
    };
  }

  // 2. Vanity "id" link: https://steamcommunity.com/id/vanityName
  const vanityMatch = url.match(/steamcommunity\.com\/id\/([^/]+)/);
  if (vanityMatch) {
    const vanityName = vanityMatch[1];
    // Call Steam API to resolve
    const steam64 = await resolveVanityURL(vanityName);
    const steam32 = convert64to32(steam64);
    return {
      steam_id_64: steam64,
      steam_id_32: steam32,
    };
  }

  // If neither matched, user might have some other pattern or a custom domain.
  // In real-world usage, you might have more logic or fallback.
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
export async function resolveVanityURL(vanity: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Missing STEAM_API_KEY environment variable.");
  }

  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${vanity}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to call Steam vanity API: ${res.statusText}`);
  }

  const data = await res.json();
  // data.response.success == 1 means success
  // data.response.steamid is the 64-bit ID
  if (data?.response?.success !== 1 || !data.response.steamid) {
    throw new Error(`Vanity resolve failed. Response: ${JSON.stringify(data)}`);
  }
  return data.response.steamid;
}

/**
 * Basic call to the Steam "GetPlayerSummaries" endpoint to get name, avatar, etc.
 * https://steamcommunity.com/dev
 */
export async function fetchSteamUserSummary(steamId64: string) {
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId64}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch player summary: ${res.statusText}`);
  }

  const data = await res.json();
  const players = data?.response?.players ?? [];
  if (players.length === 0) {
    return null;
  }

  // We’ll return just a subset of fields
  const { personaname, avatarfull } = players[0];

  return {
    steam_name: personaname as string,
    avatar_url: avatarfull as string,
  };
}

/**
 * Basic call to "GetPlayerBans" to see if there's a VAC or game ban.
 * https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/
 */
export async function fetchSteamBans(steamId64: string) {
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${steamId64}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch player bans: ${res.statusText}`);
  }

  const data = await res.json();
  const players = data?.players ?? [];
  if (players.length === 0) {
    return null;
  }

  const { VACBanned, NumberOfVACBans, NumberOfGameBans } = players[0];
  // We'll define "ban_status" as true if there's any ban
  const ban_status = VACBanned || NumberOfVACBans > 0 || NumberOfGameBans > 0;

  return { ban_status };
}
