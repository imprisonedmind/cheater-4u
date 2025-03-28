// app/api/session/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";

export async function GET() {
  const session = await getServerSession();

  if (session.steam_id_64) {
    return NextResponse.json({ user: session });
  }

  return NextResponse.json({ user: null }, { status: 401 });
}
