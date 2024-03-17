const { execSync } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const inquirer = require("inquirer");
const replace = require("replace-in-file");
const chalk = require("chalk");

const escapeRegExp = (string) =>
  // $& means the whole matched string
  string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getRandomString = (length) => crypto.randomBytes(length).toString("hex");

const spaces = (spaces = 6) => Array(spaces).fill(" ").join("");

const main = async ({ rootDirectory }) => {
  const appNameRegex = escapeRegExp("remix-gospel-stack");
  const orgNameRegex = escapeRegExp("@remix-gospel-stack");

  const DIR_NAME = path.basename(rootDirectory);
  const SUFFIX = getRandomString(2);

  const APP_NAME = DIR_NAME
    // get rid of anything that's not allowed in an app name
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  let { ORG_NAME } = await inquirer.prompt([
    {
      name: "ORG_NAME",
      type: "input",
      message: "What is the name of the monorepo @org?",
      default: `@${DIR_NAME.replace(/[^a-zA-Z0-9-_]/g, "-")}`,
      prefix: `${spaces(6)}◼ `,
    },
  ]);
  if (!ORG_NAME.startsWith("@")) {
    ORG_NAME = `@${ORG_NAME}`;
  }

  const { db } = await inquirer.prompt([
    {
      name: "db",
      type: "list",
      message: `Which database do you want to use? (Deployed to Fly.io)`,
      choices: [
        { name: `${spaces(6)}PostgreSQL`, value: "postgres" },
        {
          name: `${spaces(6)}Distributed SQLite (Litefs)`,
          value: "sqlite-litefs",
        },
      ],
      default: "postgres",
      prefix: `${spaces(6)}◼ `,
    },
  ]);

  console.log(`${spaces()}◼  Preparing monorepo for ${db}...`);
  execSync(
    `pnpm turbo gen scaffold-database --args ${ORG_NAME}/remix-app remix-app ${db}`,
    {
      cwd: rootDirectory,
      stdio: "ignore",
    },
  );

  await rootConfigsRename({
    rootDirectory,
    orgNameRegex,
    appNameRegex,
    ORG_NAME,
    APP_NAME,
  });
  await renameAll({
    rootDirectory,
    orgNameRegex,
    appNameRegex,
    ORG_NAME,
    APP_NAME,
  });
  console.log(`
${spaces()}${chalk.green(
    `✔  ${chalk.bold(ORG_NAME)} remix app and packages setup.`,
  )}
`);

  await copyENV({ rootDirectory });

  execSync("pnpm run format", {
    cwd: rootDirectory,
    stdio: "ignore",
  });

  execSync("pnpm i --fix-lockfile", { cwd: rootDirectory, stdio: "ignore" });

  console.log(
    `
${chalk.green(
  `
${spaces()}✔  Setup is almost complete. Follow these steps to finish initialization:
`,
)}
${spaces(
  9,
)}- CD and Run setup (this generate First migration, prisma client, seed db, build):
${spaces(9)}  ${chalk.yellow(chalk.bold(`cd ${rootDirectory}`))}
${spaces(9)}  ${chalk.yellow(chalk.bold("pnpm run setup"))}

${
  db === "postgres"
    ? `
${spaces(9)}- Run all the apps/packages dev scripts concurrently:
${spaces(9)}  ${chalk.bold("pnpm run dev")}

${spaces(9)}OR

${spaces(9)}- Run only the Remix app:
${spaces(9)}  ${chalk.yellow(
        chalk.bold(`pnpm run dev --filter=${ORG_NAME}/remix-app`),
      )}
`
    : `
${spaces(9)}- Run the remix app:
${spaces(9)}  ${chalk.yellow(
        chalk.bold(`pnpm run dev --filter=${ORG_NAME}/remix-app`),
      )}

${spaces()}⚠️  With local sqlite database you cannot run the NextJS app concurrently 
${spaces()}   to the remix app, as they will both connect on the same sqlite file creating errors!
`
}`.trim(),
  );
};

const rootConfigsRename = async ({
  rootDirectory,
  orgNameRegex,
  appNameRegex,
  ORG_NAME,
  APP_NAME,
}) => {
  const README_PATH = path.join(rootDirectory, "README.md");
  const FLY_TOML_PATH = path.join(
    rootDirectory,
    "apps",
    "remix-app",
    "fly.toml",
  );
  const LITEFS_YML_PATH = path.join(
    rootDirectory,
    "apps",
    "remix-app",
    "other",
    "litefs.yml",
  );
  const PKG_PATH = path.join(rootDirectory, "package.json");
  // const ESLINT_PATH = path.join(rootDirectory, ".eslintrc.js");
  const PRETTIER_PATH = path.join(rootDirectory, ".prettierrc.js");
  const DEPLOY_PATH = path.join(
    rootDirectory,
    ".github",
    "workflows",
    "deploy.yml",
  );
  const TURBO_PATH = path.join(rootDirectory, "turbo.json");
  const DOCKER_COMPOSE_PATH = path.join(rootDirectory, "docker-compose.yml");

  const globalOrgNameRegex = new RegExp(orgNameRegex, "g");

  const [
    flyTomlContent,
    readme,
    packageJson,
    // eslint,
    prettier,
    githubCI,
    turbo,
  ] = await Promise.all([
    fs.readFile(FLY_TOML_PATH, "utf-8"),
    fs.readFile(README_PATH, "utf-8"),
    fs.readFile(PKG_PATH, "utf-8"),
    // fs.readFile(ESLINT_PATH, "utf-8"),
    fs.readFile(PRETTIER_PATH, "utf-8"),
    fs.readFile(DEPLOY_PATH, "utf-8"),
    fs.readFile(TURBO_PATH, "utf-8"),
  ]);

  const newFlyTomlContent = flyTomlContent.replace(
    new RegExp(appNameRegex, "g"),
    APP_NAME,
  );
  const newPackageJson = packageJson
    .replace(globalOrgNameRegex, ORG_NAME)
    .replace(new RegExp(appNameRegex, "g"), APP_NAME);
  // const newEslint = eslint.replace(globalOrgNameRegex, ORG_NAME);
  const newPrettier = prettier.replace(globalOrgNameRegex, ORG_NAME);
  const newReadme = readme
    .replace(globalOrgNameRegex, ORG_NAME)
    .replaceAll(new RegExp(appNameRegex, "g"), APP_NAME);
  const newGithubCI = githubCI.replace(globalOrgNameRegex, ORG_NAME);
  const newTurbo = turbo.replace(globalOrgNameRegex, ORG_NAME);

  try {
    const dockerCompose = await fs.readFile(DOCKER_COMPOSE_PATH, "utf-8");
    const newDockerCompose = dockerCompose.replaceAll(
      "remix-gospel-stack-postgres",
      `${APP_NAME}-postgres`,
    );
    await fs.writeFile(DOCKER_COMPOSE_PATH, newDockerCompose);
  } catch (error) {
    // pass, no Dockerfile for that setup
  }

  try {
    const litefsYML = await fs.readFile(LITEFS_YML_PATH, "utf-8");
    const newLitefsYML = litefsYML
      .replace(globalOrgNameRegex, ORG_NAME)
      .replaceAll(new RegExp(appNameRegex, "g"), APP_NAME);
    await fs.writeFile(LITEFS_YML_PATH, newLitefsYML);
  } catch (error) {
    // pass, no litefs.yml for that setup
  }

  try {
    const DOCKER_COMPOSE_PATH = path.join(rootDirectory, "docker-compose.yml");
    const dockerCompose = await fs.readFile(DOCKER_COMPOSE_PATH, "utf-8");
    const newDockerCompose = dockerCompose.replaceAll(
      "remix-gospel-stack-postgres",
      `${APP_NAME}-postgres`,
    );
    await fs.writeFile(DOCKER_COMPOSE_PATH, newDockerCompose);
  } catch (error) {
    // pass, no Dockerfile for that setup
  }

  const fileOperationPromises = [
    fs.writeFile(FLY_TOML_PATH, newFlyTomlContent),
    fs.writeFile(README_PATH, newReadme),
    fs.writeFile(PKG_PATH, newPackageJson),
    // fs.writeFile(ESLINT_PATH, newEslint),
    fs.writeFile(PRETTIER_PATH, newPrettier),
    fs.writeFile(DEPLOY_PATH, newGithubCI),
    fs.writeFile(TURBO_PATH, newTurbo),
    fs.rm(path.join(rootDirectory, "LICENSE.md")),
    fs.rm(path.join(rootDirectory, "CONTRIBUTING.md")),
  ];

  await Promise.all(fileOperationPromises);
};

const copyENV = async ({ rootDirectory }) => {
  const EXAMPLE_ENV_PATH = path.join(rootDirectory, ".env.example");
  const ENV_PATH = path.join(rootDirectory, ".env");
  const env = await fs.readFile(EXAMPLE_ENV_PATH, "utf-8");
  const newEnv = env.replace(
    /^SESSION_SECRET=.*$/m,
    `SESSION_SECRET="${getRandomString(16)}"`,
  );
  await fs.writeFile(ENV_PATH, newEnv);
};

const renameAll = async ({
  rootDirectory,
  orgNameRegex,
  appNameRegex,
  ORG_NAME,
  APP_NAME,
}) => {
  await replace({
    files: [
      path.join(rootDirectory, "apps", "**", "*.json"),
      path.join(rootDirectory, "apps", "**", "*.js"),
      path.join(rootDirectory, "apps", "**", "*.ts"),
      path.join(rootDirectory, "apps", "**", "*.tsx"),
      path.join(rootDirectory, "apps", "**", "vite.config.ts"),
      path.join(rootDirectory, "apps", "**", "Dockerfile"),
      path.join(rootDirectory, "apps", "**", ".eslintrc.cjs"),
      path.join(rootDirectory, "apps", "**", "README.md"),
    ],
    from: new RegExp(orgNameRegex, "g"),
    to: ORG_NAME,
  });

  await replace({
    files: [path.join(rootDirectory, "apps", "**", "package.json")],
    from: new RegExp(appNameRegex, "g"),
    to: APP_NAME,
  });

  await replace({
    files: [
      path.join(rootDirectory, "config", "**", "*.json"),
      path.join(rootDirectory, "config", "**", "*.js"),
    ],
    from: new RegExp(orgNameRegex, "g"),
    to: ORG_NAME,
  });

  await replace({
    files: [
      path.join(rootDirectory, "packages", "**", "*.json"),
      path.join(rootDirectory, "packages", "**", "*.js"),
      path.join(rootDirectory, "packages", "**", "*.ts"),
      path.join(rootDirectory, "packages", "**", "*.tsx"),
      path.join(rootDirectory, "packages", "**", ".eslintrc.cjs"),
    ],
    from: new RegExp(orgNameRegex, "g"),
    to: ORG_NAME,
  });
};

module.exports = main;
