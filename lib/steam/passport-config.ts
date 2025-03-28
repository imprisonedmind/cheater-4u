// lib/steam/passport-config.ts
import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";

if (!(passport as any)._strategy("steam")) {
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj: any, done) => done(null, obj));

  passport.use(
    new SteamStrategy(
      {
        returnURL: `${process.env.HOSTED_URL}api/auth/steam/callback`,
        realm: process.env.HOSTED_URL!,
        apiKey: process.env.STEAM_API_KEY!,
      },
      function (_identifier, profile, done) {
        return done(null, profile);
      },
    ),
  );
}

export default passport;
