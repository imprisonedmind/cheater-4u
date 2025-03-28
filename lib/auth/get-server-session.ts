// lib/auth/get-server-session.ts
import { getIronSession, IronSession } from "iron-session";
import { sessionOptions, SessionUser } from "./session";
import { cookies } from "next/headers";

export async function getServerSession(): Promise<IronSession<SessionUser>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const req = {
    headers: {
      cookie: cookieHeader,
    },
  } as any;

  const res = {
    getHeader() {},
    setHeader() {},
  } as any;

  return await getIronSession<SessionUser>(req, res, sessionOptions);
}
