// lib/auth/withSession.ts
import { getIronSession } from "iron-session";
import { sessionOptions, SessionUser } from "./session";
import type { NextApiRequest, NextApiResponse } from "next";

export function getSession(req: NextApiRequest, res: NextApiResponse) {
  return getIronSession<SessionUser>(req, res, sessionOptions);
}
