import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import type { AppConfig } from "@remix-run/dev";
import type { PlopTypes } from "@turbo/gen";
import JSON5 from "json5";
import { loadFile, writeFile } from "magicast";

type SupportedDatabases = "postgres" | "sqlite-litefs";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });
  plop.setGenerator("scaffold-database", {
    description: "Create a Dockerfile",
    prompts: [
      {
        type: "input",
        name: "appPckgName",
        message: "Name entry in package.json of the app",
      },
      {
        type: "input",
        name: "appDirname",
        message: "Directory name of the app",
      },
      {
        type: "list",
        name: "dbType",
        message: "What type of database does the app use?",
        choices: ["sqlite-litefs", "postgres"],
        default: "postgres",
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ appDirname }}/Dockerfile",
        templateFile: "templates/Dockerfile.hbs",
        force: true,
      },
      function updatePackageJson(answers: {
        appPckgName?: string;
        appDirname?: string;
        dbType?: "postgres" | "sqlite-litefs";
      }) {
        const appPackageJsonPath = path.join(
          // resolves to the root of the current workspace
          plop.getDestBasePath(),
          "apps",
          answers.appDirname ?? "",
          "package.json",
        );
        const packageJson = JSON.parse(
          fs.readFileSync(appPackageJsonPath, "utf8"),
        );

        if (answers.dbType === "postgres") {
          delete packageJson.dependencies["litefs-js"];
          packageJson.scripts["docker:db"] =
            "docker compose -f docker-compose.yml up -d";
          packageJson.scripts["docker:run:remix-app"] =
            "docker run -it --init --rm -p 3000:3000 --env-file .env.docker --env DATABASE_URL='postgresql://postgres:postgres@db:5432/postgres' --network=app_network coraalt-remix-app";
          packageJson.scripts["setup"] =
            "pnpm run docker:db && pnpm run db:migrate:dev && turbo run db:migrate:force db:seed build";
          fs.writeFileSync(
            appPackageJsonPath,
            JSON.stringify(packageJson, null, 2),
          );
          return "Removed litefs-js from dependencies";
        } else {
          packageJson.dependencies["litefs-js"] = "^1.1.2";
          delete packageJson.scripts["docker:db"];
          delete packageJson.scripts["docker:run:remix-app"];
          packageJson.scripts["setup"] =
            "pnpm run db:migrate:dev && turbo run db:migrate:force db:seed build";
          fs.writeFileSync(
            appPackageJsonPath,
            JSON.stringify(packageJson, null, 2),
          );
          return "Added litefs-js to dependencies";
        }
      },
      function createOrDeleteDockerCompose(answers: {
        appPckgName?: string;
        appDirname?: string;
        dbType?: SupportedDatabases;
      }) {
        return "done";
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ appDirname }}/app/entry.server.tsx",
        templateFile: "templates/entry.server.tsx.hbs",
        force: true,
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ appDirname }}/fly.toml",
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
        appPckgName?: string;
        appDirname?: string;
        dbType?: SupportedDatabases;
      }) {
        if (answers.dbType === "sqlite-litefs") {
          fs.unlinkSync(
            path.join(plop.getDestBasePath(), "docker-compose-ci.yml"),
          );
          fs.unlinkSync(
            path.join(plop.getDestBasePath(), "docker-compose.yml"),
          );
          fs.copyFileSync(
            path.join(
              plop.getDestBasePath(),
              "turbo",
              "generators",
              "templates",
              "litefs.yml",
            ),
            path.join(
              plop.getDestBasePath(),
              "apps",
              answers.appDirname ?? "remix-app",
              "other",
              "litefs.yml",
            ),
          );
          return "Removed postgres docker-compose files";
        }
        try {
          fs.unlinkSync(
            path.join(
              plop.getDestBasePath(),
              "apps",
              answers.appDirname ?? "remix-app",
              "other",
              "litefs.yml",
            ),
          );
        } catch (err) {
          // ignore
        }

        return "Postgres docker-compose files kept";
      },
      async function updatePrismaSchema(answers: {
        dbType?: SupportedDatabases;
      }) {
        const prismaSchemaPath = path.join(
          // resolves to the root of the current workspace
          plop.getDestBasePath(),
          "packages",
          "database",
          "prisma",
          "schema.prisma",
        );
        const prismaSchema = fs.readFileSync(prismaSchemaPath, "utf8");
        if (answers.dbType === "sqlite-litefs") {
          fs.writeFileSync(
            prismaSchemaPath,
            prismaSchema.replace(
              /provider = "postgresql"/g,
              'provider = "sqlite"',
            ),
          );
          return "Updated prisma schema to use sqlite";
        } else {
          fs.writeFileSync(
            prismaSchemaPath,
            prismaSchema.replace(
              /provider = "sqlite"/g,
              'provider = "postgresql"',
            ),
          );
          return "Updated prisma schema to use postgres";
        }
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/.env.example",
        templateFile: "templates/.env.example.hbs",
        force: true,
      },
      async function githubDeployWorkflow(answers: {
        appPckgName?: string;
        appDirname?: string;
        dbType?: SupportedDatabases;
      }) {
        if (answers.dbType === "sqlite-litefs") {
          // copy deploy-with-litefs.yml to .github/workflows/deploy.yml
          fs.copyFileSync(
            path.join(
              plop.getDestBasePath(),
              "turbo",
              "generators",
              "templates",
              "deploy-with-litefs.yml",
            ),
            path.join(
              plop.getDestBasePath(),
              ".github",
              "workflows",
              "deploy.yml",
            ),
          );
          return "Copied deploy-with-litefs.yml to .github/workflows/deploy.yml";
        }
        if (answers.dbType === "postgres") {
          // copy deploy-with-postgres.yml to .github/workflows/deploy.yml
          fs.copyFileSync(
            path.join(
              plop.getDestBasePath(),
              "turbo",
              "generators",
              "templates",
              "deploy-with-postgres.yml",
            ),
            path.join(
              plop.getDestBasePath(),
              ".github",
              "workflows",
              "deploy.yml",
            ),
          );
          return "Copied deploy-with-postgres.yml to .github/workflows/deploy.yml";
        }

        return "No deploy workflow added";
      },
    ],
  });
  plop.setGenerator("add internal package", {
    description: "Adds a new internal package as a dependency",
    prompts: [
      {
        type: "list",
        name: "package",
        message: "Which package should be added?",
        choices: () => {
          // read the name field of the package.json within each packages directory
          const packages = fs.readdirSync("packages");
          return packages.map((packageDir) => {
            const packageJson = JSON.parse(
              fs.readFileSync(`packages/${packageDir}/package.json`, "utf8"),
            );
            return {
              name: packageJson.name,
              value: packageJson.name,
            };
          });
        },
      },
    ],
    actions: [
      // add the new package to package.json
      {
        type: "append",
        path: "package.json",
        pattern: /"dependencies":\s{0,1}{/g,
        template: '    "{{ package }}": "workspace:*",',
      },
      async (answers: { package?: string }): Promise<string> => {
        const dirname = fs
          .readdirSync("packages")
          .map((packageDir) => {
            const packageJson = JSON.parse(
              fs.readFileSync(`packages/${packageDir}/package.json`, "utf8"),
            );
            return {
              name: packageJson.name,
              path: packageDir,
            };
          })
          .filter((p) => p.name === answers.package)[0].path;
        try {
          const mod = await loadFile<{ default: AppConfig }>(
            "./apps/remix-app/vite.config.ts",
          );

          if (
            mod.exports.default.serverDependenciesToBundle &&
            mod.exports.default.serverDependenciesToBundle !== "all"
          ) {
            mod.exports.default.serverDependenciesToBundle.push(
              answers.package || "",
            );
          }
          if (mod.exports.default.watchPaths) {
            (mod.exports.default.watchPaths as string[]).push(
              `../../packages/${dirname}/src/**/*`,
            );
          }
          // @ts-ignore
          await writeFile(mod, "./apps/remix-app/vite.config.ts");
          return "updated vite.config.ts";
        } catch (err) {
          console.log(err);
          return "failed";
        }
      },
      async (answers: { package?: string }): Promise<string> => {
        const dirname = fs
          .readdirSync("packages")
          .map((packageDir) => {
            const packageJson = JSON.parse(
              fs.readFileSync(`packages/${packageDir}/package.json`, "utf8"),
            );
            return {
              name: packageJson.name,
              path: packageDir,
            };
          })
          .filter((p) => p.name === answers.package)[0].path;
        try {
          const tsconfig = JSON5.parse(
            fs.readFileSync(`./apps/remix-app/tsconfig.json`, "utf8"),
          );

          tsconfig.compilerOptions.paths = {
            ...tsconfig.compilerOptions.paths,
            [`${answers.package}`]: [`../../packages/${dirname}/src/index`],
            [`${answers.package}/*`]: [`../../packages/${dirname}/src/*`],
          };
          fs.writeFileSync(
            `./apps/remix-app/tsconfig.json`,
            JSON.stringify(tsconfig, null, 2),
          );

          return "updated tsconfig.json";
        } catch (err) {
          console.log(err);
          return "failed";
        }
      },
      // install
      (): string => {
        try {
          execSync(`pnpm install`);
          return "install completed";
        } catch (err) {
          return "install failed";
        }
      },
    ],
  });
}
