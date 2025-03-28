import express from "express";
import session from "express-session";
import passport from "@/lib/steam/passport-config"; // ✅ shared config

const loginApp = express();

loginApp.set("trust proxy", 1);

loginApp.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  }),
);
loginApp.use(passport.initialize());
loginApp.use(passport.session());

loginApp.get("/", passport.authenticate("steam"));

export default loginApp;
