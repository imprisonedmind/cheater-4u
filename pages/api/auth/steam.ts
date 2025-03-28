import type { NextApiRequest, NextApiResponse } from "next";
import loginApp from "@/lib/steam/steam-login-app";

// patch the URL so Express sees "/"
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Steam API route hit:", req.method, req.url);

  // 👇 force the URL to "/"
  req.url = "/";
  return loginApp(req as any, res as any);
}
