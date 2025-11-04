import fs from "node:fs";
import path from "node:path";
import { PlopTypes } from "@turbo/gen";
import { glob } from "glob";

import { editPackageJson, readPackageName } from "./utils";

type SupportedDatabases = "postgres" | "turso";
type SupportedOrms = "drizzle" | "prisma";

export const registerScaffoldInfrastructureDbGenerator = (
  plop: PlopTypes.NodePlopAPI,
) => {
  const rootPath = plop.getDestBasePath();
  const apps = glob
    .sync("apps/**/package.json", {
      ignore: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.turbo/**",
        "**/build/**",
      ],
    })
    .map((app) => {
      const dirname = path.dirname(app);
      const packageJson = JSON.parse(fs.readFileSync(app, "utf8"));
      return {
        name: packageJson.name,
        dirname: dirname.split("/").pop(),
      };
    });
  plop.setGenerator("scaffold-database", {
    description: "Configure database and ORM setup",
    prompts: [
      {
        type: "list",
        name: "dbType",
        message: "Which database do you want to use?",
        choices: [
          { name: "Turso (SQLite with libSQL)", value: "turso" },
          { name: "PostgreSQL", value: "postgres" },
        ],
        default: "turso",
      },
      {
        type: "list",
        name: "ormType",
        message: "Which ORM do you want to use?",
        choices: [
          { name: "Drizzle (recommended)", value: "drizzle" },
          { name: "Prisma", value: "prisma" },
        ],
        default: "drizzle",
      },
      {
        type: "list",
        name: "app",
        message: "Which app do you want to update with database and ORM setup?",
        choices: apps.map((app) => ({
          name: `[./apps/${app.dirname}] ${app.name}`,
          value: { dirname: app.dirname, pkgName: app.name },
        })),
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ app.dirname }}/other/Dockerfile",
        templateFile: "templates/Dockerfile.hbs",
        force: true,
      },
      async function updateAppScripts(answers: {
        app?: { dirname: string; pkgName: string };
        dbType?: "postgres" | "turso";
        ormType?: "drizzle" | "prisma";
      }) {
        const appPackageJsonPath = path.join(
          // resolves to the root of the current workspace
          rootPath,
          "apps",
          answers.app?.dirname ?? "",
        );
        switch (answers.dbType) {
          case "postgres":
            await editPackageJson(appPackageJsonPath, {
              addScripts: {
                "docker:db": "docker compose -f docker-compose.yml up -d",
                "docker:run:webapp":
                  "docker run -it --init --rm -p 3000:3000 --env-file .env.docker --env DATABASE_URL='postgresql://postgres:postgres@db:5432/postgres' --network=app_network coraalt-webapp",
                setup: `pnpm run docker:db && pnpm run db:migrate && turbo run db:seed build`,
              },
            });
            break;
          case "turso":
            await editPackageJson(appPackageJsonPath, {
              removeScripts: ["docker:db", "docker:run:webapp", "setup"],
              addScripts: {
                setup: `pnpm run db:migrate && turbo run db:seed build`,
              },
            });
            break;
        }
        return `Updated package.json for Turso + ${answers.ormType}`;
      },
      async function ormDatabasePackageSetup(answers: {
        app?: { dirname: string; pkgName: string };
        dbType?: SupportedDatabases;
        ormType?: SupportedOrms;
      }) {
        const infrastructurePkgPath = path.join(
          rootPath,
          "packages",
          "infrastructure",
        );
        const infrastructurePkgName = await readPackageName(
          infrastructurePkgPath,
        );
        if (!infrastructurePkgName) {
          throw new Error("Database package not found");
        }
        switch (answers.ormType) {
          case "drizzle": {
            await editPackageJson(infrastructurePkgPath, {
              addDependencies: {
                "drizzle-orm": "catalog:drizzle",
              },
              addDevDependencies: {
                "drizzle-kit": "catalog:drizzle",
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
                "db:migrate:production":
                  "pnpm with-production-env drizzle-kit push",
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
            await editPackageJson(infrastructurePkgPath, {
              addDependencies: {
                prisma: "catalog:prisma",
              },
              addDevDependencies:
                answers.dbType === "turso"
                  ? {
                      "@prisma/adapter-libsql": "catalog:prisma",
                      "@prisma/client": "catalog:prisma",
                    }
                  : answers.dbType === "postgres"
                    ? {
                        "@prisma/adapter-pg": "catalog:prisma",
                        "@prisma/client": "catalog:prisma",
                      }
                    : {},
              removeDependencies: ["drizzle-orm", "drizzle-kit"],
              addScripts: {
                "db:generate":
                  "pnpm with-env prisma generate && pnpm with-env prisma migrate dev --create-only",
                "db:migrate":
                  answers.dbType === "turso"
                    ? "pnpm with-env prisma migrate dev"
                    : "pnpm with-env prisma migrate dev",
                "db:migrate:production":
                  answers.dbType === "turso"
                    ? "pnpm with-env prisma migrate dev"
                    : "pnpm with-production-env prisma migrate deploy",
                "db:seed": "pnpm with-env tsx src/seed.ts",
                "db:studio": "pnpm with-env prisma studio",
              },
            });
            break;
          }
        }
        await editPackageJson(
          path.join(rootPath, "apps", answers.app?.dirname ?? ""),
          {
            addDependencies: {
              [infrastructurePkgName]: `workspace:*`,
            },
          },
        );
        return "Updated package.json";
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ app.dirname }}/app/entry.server.tsx",
        templateFile: "templates/entry.server.tsx.hbs",
        force: true,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ app.dirname }}/fly.toml",
        templateFile: "templates/fly.toml.hbs",
        force: true,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/docker-compose-ci.yml",
        templateFile: "templates/docker-compose-ci.yml.hbs",
        force: true,
        skip: (answers: { dbType: SupportedDatabases }) =>
          answers.dbType !== "postgres",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/docker-compose.yml",
        templateFile: "templates/docker-compose.yml.hbs",
        force: true,
        skip: (answers: { dbType: SupportedDatabases }) =>
          answers.dbType !== "postgres",
      },
      function cleanupDockerCompose(answers: {
        app?: { dirname: string; pkgName: string };
        dbType?: SupportedDatabases;
      }) {
        if (answers.dbType === "turso") {
          try {
            fs.unlinkSync(path.join(rootPath, "docker-compose-ci.yml"));
          } catch (err) {
            // ignore if file doesn't exist
          }
          try {
            fs.unlinkSync(path.join(rootPath, "docker-compose.yml"));
          } catch (err) {
            // ignore if file doesn't exist
          }
          return "Removed postgres docker-compose files for Turso setup";
        }

        return "Postgres docker-compose files kept";
      },
      // Update Prisma schema if using Prisma
      async function updatePrismaSchema(answers: {
        dbType?: SupportedDatabases;
        ormType?: SupportedOrms;
      }) {
        if (answers.ormType === "prisma") {
          const prismaSchemaPath = path.join(
            rootPath,
            "packages",
            "infrastructure",
            "database",
            "prisma",
            "schema.prisma",
          );
          const prismaSchema = fs.readFileSync(prismaSchemaPath, "utf8");
          if (answers.dbType === "turso") {
            fs.writeFileSync(
              prismaSchemaPath,
              prismaSchema.replace(
                /provider = "postgresql"/g,
                'provider = "sqlite"',
              ),
            );
            return "Updated Prisma schema to use sqlite for Turso";
          } else {
            fs.writeFileSync(
              prismaSchemaPath,
              prismaSchema.replace(
                /provider = "sqlite"/g,
                'provider = "postgresql"',
              ),
            );
            return "Updated Prisma schema to use postgresql";
          }
        }
        return "Using Drizzle (Prisma schema not updated)";
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ app.dirname }}/.env.example",
        templateFile: "templates/env.example.hbs",
        force: true,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/infrastructure/.env.example",
        templateFile: "templates/env.example.hbs",
        force: true,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/infrastructure/src/database/index.ts",
        templateFile: "templates/{{ ormType }}/database/index.ts.hbs",
        force: true,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/infrastructure/src/database/seed.ts",
        templateFile: "templates/{{ ormType }}/database/seed.ts.hbs",
        force: true,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/infrastructure/src/database/client.ts",
        templateFile: "templates/{{ ormType }}/database/client.ts.hbs",
        force: true,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/infrastructure/src/repositories/index.ts",
        templateFile: "templates/{{ ormType }}/repositories/index.ts.hbs",
        force: true,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/infrastructure/src/repositories/user-repository.ts",
        templateFile:
          "templates/{{ ormType }}/repositories/user-repository.ts.hbs",
        force: true,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/infrastructure/drizzle/schema.ts",
        templateFile: "templates/drizzle/schema.ts.hbs",
        force: true,
        skip: (answers: { ormType?: SupportedOrms }) =>
          answers.ormType === "prisma"
            ? "Skipping Drizzle schema (using Prisma)"
            : false,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/infrastructure/prisma/schema.prisma",
        templateFile: "templates/prisma/schema.prisma.hbs",
        force: true,
        skip: (answers: { ormType?: SupportedOrms }) =>
          answers.ormType === "drizzle"
            ? "Skipping Prisma schema (using Drizzle)"
            : false,
      },
      async function githubDeployWorkflow(answers: {
        app?: { dirname: string; pkgName: string };
        dbType?: SupportedDatabases;
      }) {
        if (answers.dbType === "turso") {
          // copy deploy-with-turso.yml to .github/workflows/deploy.yml
          fs.copyFileSync(
            path.join(
              rootPath,
              "turbo",
              "generators",
              "templates",
              "deploy-with-turso.yml",
            ),
            path.join(rootPath, ".github", "workflows", "deploy.yml"),
          );
          return "Copied deploy-with-turso.yml to .github/workflows/deploy.yml";
        }
        if (answers.dbType === "postgres") {
          // copy deploy-with-postgres.yml to .github/workflows/deploy.yml
          fs.copyFileSync(
            path.join(
              rootPath,
              "turbo",
              "generators",
              "templates",
              "deploy-with-postgres.yml",
            ),
            path.join(rootPath, ".github", "workflows", "deploy.yml"),
          );
          return "Copied deploy-with-postgres.yml to .github/workflows/deploy.yml";
        }

        return "No deploy workflow added";
      },
    ],
  });
};
