import "dotenv/config";

import { join } from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  migrations: {
    path: join("packages", "database", "prisma", "migrations"),
    seed: `node ${join("packages", "database", "src", "seed.ts")}`,
  },
  schema: join("packages", "database", "prisma", "schema.prisma"),
});
