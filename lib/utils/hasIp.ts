import crypto from "node:crypto"

/**
 * Hashes an IP address for privacy, using a secret salt.
 * @param ip The IP address (e.g. "123.45.67.89")
 * @returns A hex-encoded SHA256 hash string
 */
export async function hashIP(ip: string): Promise<string> {
  const salt = process.env.IP_SALT ?? "some_secret_salt"
  return crypto.createHash("sha256").update(ip + salt).digest("hex")
}
