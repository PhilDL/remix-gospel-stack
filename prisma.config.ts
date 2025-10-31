import "dotenv/config";

import { join } from "node:path";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { defineConfig } from "prisma/config";

export default defineConfig({
  migrations: {
    path: join("packages", "database", "prisma", "migrations"),
    seed: `node ${join("packages", "database", "src", "seed.ts")}`,
  },
  schema: join("packages", "database", "prisma", "schema.prisma"),
  async adapter() {
    return new PrismaLibSQL({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_TOKEN,
      syncUrl: process.env.DATABASE_SYNC_URL,
    });
  },
});
