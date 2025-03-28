import express from "express";
import session from "express-session";
import passport from "@/lib/steam/passport-config";
import { STEAM32_OFFSET } from "@/lib/constants";
import { sessionOptions, SessionUser } from "@/lib/auth/session";
import { getIronSession } from "iron-session";

const callbackApp = express();
callbackApp.set("trust proxy", 1);

callbackApp.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  }),
);

callbackApp.use(passport.initialize());
callbackApp.use(passport.session());

callbackApp.get(
  "/api/auth/steam/callback",
  passport.authenticate("steam", { failureRedirect: "/" }),
  async function (req: any, res) {
    const steamProfile = req.user;

    const steam_id_64 = steamProfile.id;
    const steam_id_32 = (
      BigInt(steam_id_64) - BigInt(STEAM32_OFFSET)
    ).toString();
    const steam_url = steamProfile._json.profileurl;
    const steam_name = steamProfile.displayName;
    const steam_avatar_url =
      steamProfile._json.avatarfull || steamProfile._json.avatarmedium;

    // 🔁 Upsert into Supabase
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY!,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        steam_id_64,
        steam_id_32,
        steam_url,
        steam_name,
        steam_avatar_url,
      }),
    });

    // 🧠 Set Iron Session
    const session = await getIronSession<SessionUser>(req, res, sessionOptions);
    session.steam_id_64 = steam_id_64;
    session.steam_id_32 = steam_id_32;
    session.steam_url = steam_url;
    session.steam_name = steam_name;
    session.steam_avatar_url = steam_avatar_url;
    session.role = "user";
    await session.save();

    res.redirect("/reports/new");
  },
);

export default callbackApp;
