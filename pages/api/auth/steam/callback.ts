import type { NextApiRequest, NextApiResponse } from "next";
import callbackApp from "@/lib/steam/steam-callback-app";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return callbackApp(req as any, res as any);
}
