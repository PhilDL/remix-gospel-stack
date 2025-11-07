import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PlopTypes } from "@turbo/gen";
import { glob } from "glob";

import { editPackageJson, merge, readPackageName } from "./utils";

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
  let orgName = JSON.parse(
    fs.readFileSync(path.join(rootPath, "package.json"), "utf8"),
  ).name as string;
  if (!orgName || typeof orgName !== "string" || !orgName.endsWith("/root")) {
    throw new Error("Organization name not found in package.json");
  }
  orgName = orgName.replace("/root", "").replace("@", "");
  const databaseName =
    orgName
      .toLowerCase()
      .replaceAll("/", "_")
      .replaceAll("-", "_")
      .replaceAll(" ", "_") + "_db";

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
          { name: "Drizzle", value: "drizzle" },
          { name: "Prisma", value: "prisma" },
        ],
        default: "drizzle",
      },
      {
        type: "list",
        name: "appDirname",
        message: "Which app do you want to update with database and ORM setup?",
        choices: apps.map((app) => ({
          name: `[./apps/${app.dirname}] ${app.name}`,
          value: app.dirname,
        })),
        default: apps[0].dirname,
      },
    ],
    actions: [
      function resolveAppFromAnswers(answers: {
        appDirname?: string;
        dbType?: "postgres" | "turso";
        ormType?: "drizzle" | "prisma";
        turbo?: { paths: { workspace: string } };
        workspaceDirname?: string;
        orgName?: string;
        databaseName?: string;
      }) {
        const app = apps.find((a) => a.dirname === answers.appDirname);
        if (!app) {
          throw new Error(`App with dirname "${answers.appDirname}" not found`);
        }
        // Add the full app object to answers for use in templates
        (answers as any).app = { dirname: app.dirname, pkgName: app.name };
        answers.workspaceDirname = answers.turbo?.paths.workspace
          .split("/")
          .pop();
        answers.orgName = orgName;
        answers.databaseName = databaseName;
        return `Resolved app: ${app.name}`;
      },
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
                "docker:run:webapp": `docker run -it --init --rm -p 3000:3000 --env-file .env.docker --env DATABASE_URL='postgresql://postgres:postgres@db:5432/${databaseName}' --network=app_network coraalt-webapp`,
                setup: `pnpm run docker:db && pnpm run db:migrate:new && turbo run db:seed build`,
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
        const isTurso = answers.dbType === "turso";
        const isPostgres = answers.dbType === "postgres";
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
              addDependencies: merge(
                {
                  "drizzle-orm": "catalog:drizzle",
                },
                isTurso && {
                  "@libsql/client": "catalog:sqlite",
                },
                isPostgres && {
                  pg: "catalog:postgresql",
                },
              ),
              addDevDependencies: merge(
                {
                  "drizzle-kit": "catalog:drizzle",
                },
                isPostgres && {
                  "@types/pg": "catalog:postgresql",
                },
              ),
              removeDependencies: [
                "prisma",
                "@prisma/client",
                "@prisma/adapter-libsql",
                "@prisma/adapter-better-sqlite3",
                "@prisma/adapter-pg",
                isTurso && "@types/pg",
                isTurso && "pg",
                isPostgres && "@libsql/client",
              ].filter((dep): dep is string => dep !== false),
              addScripts: {
                "db:migrate:new": "pnpm with-env drizzle-kit generate",
                "db:migrate:apply": "pnpm with-env drizzle-kit migrate",
                "db:migrate:apply:production":
                  "pnpm with-production-env drizzle-kit migrate",
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
              addDevDependencies: merge(
                isTurso && {
                  "@prisma/adapter-libsql": "catalog:prisma",
                  "@prisma/client": "catalog:prisma",
                },
                isPostgres && {
                  "@prisma/adapter-pg": "catalog:prisma",
                  "@prisma/client": "catalog:prisma",
                },
              ),
              removeDependencies: [
                "drizzle-orm",
                "drizzle-kit",
                isTurso && "@types/pg",
                isTurso && "pg",
                isPostgres && "@libsql/client",
              ].filter((dep): dep is string => dep !== false),
              addScripts: {
                "db:generate": "pnpm with-env prisma generate",
                "db:migrate:new":
                  "pnpm with-env prisma migrate dev --create-only",
                "db:migrate:apply": "pnpm with-env prisma migrate dev",
                "db:migrate:apply:production":
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
        path: "{{ turbo.paths.root }}/apps/{{ app.dirname }}/app/db.server.ts",
        templateFile: "templates/db.server.ts.hbs",
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
        path: "{{ turbo.paths.root }}/packages/infrastructure/{{ ormType}}.config.ts",
        templateFile: "templates/{{ ormType }}/config.ts.hbs",
        force: true,
      },
      function deleteUnusedORMFiles(answers: {
        app?: { dirname: string; pkgName: string };
        ormType?: SupportedOrms;
      }) {
        switch (answers.ormType) {
          case "drizzle":
            try {
              fs.unlinkSync(
                path.join(
                  rootPath,
                  "packages",
                  "infrastructure",
                  "prisma.config.ts",
                ),
              );
            } catch {}
            try {
              fs.rmdirSync(
                path.join(rootPath, "packages", "infrastructure", "prisma"),
                { recursive: true },
              );
            } catch {}
            return "Removed Prisma config file and folder";
          case "prisma":
            try {
              fs.unlinkSync(
                path.join(
                  rootPath,
                  "packages",
                  "infrastructure",
                  "drizzle.config.ts",
                ),
              );
            } catch {}
            try {
              fs.rmdirSync(
                path.join(rootPath, "packages", "infrastructure", "drizzle"),
                { recursive: true },
              );
            } catch {}
            return "Removed Drizzle config file and folder";
          default:
            return "Removed unused ORM files";
        }
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
      {
        type: "add",
        path: "{{ turbo.paths.root }}/.github/workflows/deploy.yml",
        templateFile: "templates/deploy-with-{{ dbType }}.yml.hbs",
        force: true,
      },
      (): string => {
        try {
          console.log("Installing new dependencies...");
          execSync(`pnpm install --fix-lockfile`, { cwd: rootPath });
          return "Installed new dependencies";
        } catch (err) {
          return "install failed";
        }
      },
      (answers: { ormType?: SupportedOrms }): string => {
        switch (answers.ormType) {
          case "drizzle":
            try {
              console.log(`Generating Drizzle migrations...`);
              execSync(`pnpm db:migrate:new`, { cwd: rootPath });
              return `Generated Drizzle migrations`;
            } catch (err) {
              return "Failed to generate database client and migrations";
            }
          case "prisma":
            try {
              console.log(
                `Generating ${answers.ormType === "prisma" ? "database client and " : ""}migrations for ${answers.ormType}...`,
              );
              execSync(`pnpm db:generate && pnpm db:migrate:new --name=init"`, {
                cwd: rootPath,
              });
              return `Generated Prisma database client and migrations`;
            } catch (err) {
              return "Failed to generate database client and migrations";
            }
          default:
            return "Skipping database client and migrations generation";
        }
      },
    ],
  });
};
