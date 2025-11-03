import fs from "node:fs";
import path from "node:path";

import { editPackageJson, readPackageName } from "./utils";

type SetOrmDatabasePackageProps = {
  rootPath: string;
  appDirname: string;
  appPckgName: string;
  dbType: "postgres" | "turso";
  ormType: "drizzle" | "prisma";
};
export const setOrmDatabasePackage = async ({
  rootPath,
  appDirname,
  appPckgName,
  dbType,
  ormType,
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
        ],
      });
      await editPackageJson(rootPath, {
        removeDependencies: [
          "prisma",
          "@prisma/adapter-libsql",
          "@prisma/client",
          "@prisma/adapter-better-sqlite3",
        ],
      });
      break;
    }
    case "prisma": {
      await editPackageJson(databasePackagePath, {
        addDependencies: {
          prisma: "prisma:catalog",
        },
        addDevDependencies: {
          "@prisma/adapter-libsql": "prisma:catalog",
          "@prisma/client": "prisma:catalog",
        },
        removeDependencies: ["drizzle-orm", "drizzle-kit"],
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
