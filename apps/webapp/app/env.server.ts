import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  server: {
    SESSION_SECRET: z.string().min(1),
    // Runtime
    APP_URL: z.string().min(1),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("production"),
    DEBUG_MOCKS: z.enum(["true", "false"]).optional().default("false"),
    ALLOW_INDEXING: z.enum(["true", "false"]).optional(),
    DATABASE_URL: z.string().min(1),
    DATABASE_AUTH_TOKEN: z.string().optional(),
    DATABASE_SYNC_URL: z.string().optional(),
  },
  client: {
    PUBLIC_NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("production"),
  },
  runtimeEnv: { ...process.env, PUBLIC_NODE_ENV: process.env.NODE_ENV },
});

export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    ALLOW_INDEXING: process.env.ALLOW_INDEXING,
    APP_URL: process.env.APP_URL,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
