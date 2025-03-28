// lib/auth/session.ts
import { SessionOptions } from "iron-session";

export interface SessionUser {
  steam_id_64: string;
  steam_id_32: string;
  steam_url: string;
  steam_name: string;
  steam_avatar_url: string;
  role: "user" | "mod" | "admin";
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "cheater4u-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
