import { remember } from "@epic-web/remember";

import { createClient } from "@react-router-gospel-stack/database";

import { env } from "./env.server";

export const db = remember("db", () => {
  console.log({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
    syncUrl: env.DATABASE_SYNC_URL,
  });
  return createClient({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
    syncUrl: env.DATABASE_SYNC_URL,
  });
});
