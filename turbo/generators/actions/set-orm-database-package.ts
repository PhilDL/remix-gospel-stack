import fs from "node:fs";
import path from "node:path";

import { editPackageJson, readPackageName } from "./utils";

type SetOrmDatabasePackageProps = {
  rootPath: string;
  appDirname: string;
  ormType: "drizzle" | "prisma";
  dbType: "turso" | "postgres";
};
export const setOrmDatabasePackage = async ({
  rootPath,
  appDirname,
  ormType,
  dbType,
}: SetOrmDatabasePackageProps) => {
  const databasePackagePath = path.join(rootPath, "packages", "database");
  const databasePackageName = await readPackageName(databasePackagePath);
  if (!databasePackageName) {
    throw new Error("Database package not found");
  }
  switch (ormType) {
    case "drizzle": {
      await editPackageJson(databasePackagePath, {
        addDependencies: {
          "drizzle-orm": "drizzle:catalog",
        },
        addDevDependencies: {
          "drizzle-kit": "drizzle:catalog",
        },
        removeDependencies: [
          "prisma",
          "@prisma/adapter-libsql",
          "@prisma/client",
          "@prisma/adapter-better-sqlite3",
          "@prisma/adapter-pg",
        ],
        addScripts: {
          "db:generate": "pnpm with-env drizzle-kit generate",
          "db:migrate": "pnpm with-env drizzle-kit migrate",
          "db:migrate:production": "pnpm with-production-env drizzle-kit push",
          "db:seed": "pnpm with-env tsx src/seed.ts",
          "db:studio": "pnpm with-env drizzle-kit studio",
        },
      });
      await editPackageJson(rootPath, {
        removeDependencies: [
          "prisma",
          "@prisma/adapter-libsql",
          "@prisma/client",
          "@prisma/adapter-better-sqlite3",
          "@prisma/adapter-pg",
        ],
      });
      break;
    }
    case "prisma": {
      await editPackageJson(databasePackagePath, {
        addDependencies: {
          prisma: "prisma:catalog",
        },
        addDevDependencies:
          dbType === "turso"
            ? {
                "@prisma/adapter-libsql": "prisma:catalog",
                "@prisma/client": "prisma:catalog",
              }
            : dbType === "postgres"
              ? {
                  "@prisma/adapter-pg": "prisma:catalog",
                  "@prisma/client": "prisma:catalog",
                }
              : {},
        removeDependencies: ["drizzle-orm", "drizzle-kit"],
        addScripts: {
          "db:generate":
            "pnpm with-env prisma generate && pnpm with-env prisma migrate dev --create-only",
          "db:migrate":
            dbType === "turso"
              ? "pnpm with-env prisma migrate dev"
              : "pnpm with-env prisma migrate dev",
          "db:migrate:production":
            dbType === "turso"
              ? "pnpm with-env prisma migrate dev"
              : "pnpm with-production-env prisma migrate deploy",
          "db:seed": "pnpm with-env tsx src/seed.ts",
          "db:studio": "pnpm with-env prisma studio",
        },
      });
      break;
    }
  }
  await editPackageJson(path.join(rootPath, "apps", appDirname), {
    addDependencies: {
      [databasePackageName]: `workspace:*`,
    },
  });
  return "Updated package.json";
};
