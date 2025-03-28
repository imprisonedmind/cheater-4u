import type { NextApiRequest, NextApiResponse } from "next";
import callbackApp from "@/lib/steam/steam-callback-app";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Steam Callback hit:", req.method, req.url);
  return callbackApp(req as any, res as any);
}
