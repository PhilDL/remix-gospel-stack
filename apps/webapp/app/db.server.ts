import { remember } from "@epic-web/remember";

import { createClient } from "@remix-gospel-stack/database";

import { env } from "./env.server";

export const db = remember("db", () => {
  return createClient({ url: env.DATABASE_URL });
});
