import fs from "node:fs";
import path from "node:path";
import { PlopTypes } from "@turbo/gen";
import { glob } from "glob";

import { setOrmDatabasePackage } from "./actions/set-orm-database-package";
import { editPackageJson } from "./actions/utils";

type SupportedDatabases = "postgres" | "turso";
type SupportedOrms = "drizzle" | "prisma";

export const registerScaffoldDatabaseGenerator = (
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
        return await setOrmDatabasePackage({
          rootPath,
          appDirname: answers.app?.dirname ?? "",
          ormType: answers.ormType ?? "drizzle",
          dbType: answers.dbType ?? "turso",
        });
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
      // Generate Drizzle schema and client files
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/database/drizzle/schema.ts",
        templateFile: "templates/drizzle/schema.ts.hbs",
        force: true,
        skip: (answers: { ormType?: SupportedOrms }) =>
          answers.ormType === "prisma"
            ? "Skipping Drizzle schema (using Prisma)"
            : false,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/database/src/drizzle-client.ts",
        templateFile: "templates/drizzle/client.ts.hbs",
        force: true,
        skip: (answers: { ormType?: SupportedOrms }) =>
          answers.ormType === "prisma"
            ? "Skipping Drizzle client (using Prisma)"
            : false,
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
        path: "{{ turbo.paths.root }}/.env.example",
        templateFile: "templates/env.example.hbs",
        force: true,
      },
      // Update database package index based on ORM choice
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/database/src/index.ts",
        templateFile: "templates/{{ ormType }}/index.ts.hbs",
        force: true,
      },
      // Update seed file based on ORM choice
      {
        type: "add",
        path: "{{ turbo.paths.root }}/packages/database/src/seed.ts",
        templateFile: "templates/{{ ormType }}/seed.ts.hbs",
        force: true,
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
