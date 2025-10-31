import { createCookieSessionStorage } from "react-router";

import { env } from "~/env.server.ts";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__app_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
});
