import express from "express";
import session from "express-session";
import passport from "@/lib/steam/passport-config";
import { STEAM32_OFFSET } from "@/lib/constants";
import { sessionOptions, SessionUser } from "@/lib/auth/session";
import { getIronSession } from "iron-session";
import {
  fetchSupabase,
  mutateSupabase,
} from "@/lib/utils/supabase/helpers/supabase-fetch-helper";

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

    let user;

    try {
      // Try upsert with resolution — may still fail due to some constraint issues
      const result = await mutateSupabase({
        method: "POST",
        query: "users",
        body: {
          steam_id_64,
          steam_id_32,
          steam_url,
          steam_name,
          steam_avatar_url,
        },
        prefer: "return=representation,resolution=merge-duplicates",
      });

      user = result?.[0];
    } catch (err) {
      // If it's a conflict (e.g., unique constraint violation), fallback
      const isConflict = String(err).includes(
        "duplicate key value violates unique constraint",
      );

      if (!isConflict) {
        console.error("User upsert failed:", err);
        return res.redirect("/?error=auth");
      }

      // ⛑️ Fallback: fetch the existing user manually
      try {
        const fallbackRes = await fetchSupabase({
          query: `users?select=id,role&steam_id_64=eq.${steam_id_64}`,
        });

        if (!fallbackRes.ok) {
          const msg = await fallbackRes.text();
          throw new Error("Fallback fetch failed: " + msg);
        }

        user = (await fallbackRes.json())?.[0];
      } catch (fallbackErr) {
        console.error("Fallback fetch failed:", fallbackErr);
        return res.redirect("/?error=auth");
      }
    }

    if (!user?.id) {
      console.error("User record has no ID");
      return res.redirect("/?error=auth");
    }

    // 🧠 Save into Iron Session
    const session = await getIronSession<SessionUser>(req, res, sessionOptions);
    session.id = user.id;
    session.steam_id_64 = steam_id_64;
    session.steam_id_32 = steam_id_32;
    session.steam_url = steam_url;
    session.steam_name = steam_name;
    session.steam_avatar_url = steam_avatar_url;
    session.role = user.role;
    await session.save();

    res.redirect("/reports/new");
  },
);

export default callbackApp;
