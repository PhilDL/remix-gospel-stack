import "dotenv/config"; // make sure to install dotenv package

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  out: "./drizzle/migrations",
  schema: "./drizzle/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
});
