const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const inquirer = require("inquirer");
const replace = require("replace-in-file");

const escapeRegExp = (string) =>
  // $& means the whole matched string
  string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getRandomString = (length) => crypto.randomBytes(length).toString("hex");

const main = async ({ isTypeScript, rootDirectory }) => {
  if (!isTypeScript) {
    // isTypeScript is always false here... not sure why.
    console.log(`This template only supports TypeScript`);
  }

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
      message: "What is the name of the org?",
      default: `@${DIR_NAME.replace(/[^a-zA-Z0-9-_]/g, "-")}`,
    },
  ]);
  if (!ORG_NAME.startsWith("@")) {
    ORG_NAME = `@${ORG_NAME}`;
  }

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
  console.log("✨ App personalization complete.");
  console.log("📦 Installing dependencies...");

  execSync("pnpm i --fix-lockfile", { cwd: rootDirectory, stdio: "inherit" });

  execSync("pnpm run format", {
    cwd: rootDirectory,
    stdio: "inherit",
  });

  console.log(
    `
✅ Setup is almost complete. Follow these steps to finish initialization:

  cd ${rootDirectory}

- Start the database:
  pnpm run docker:db

- Run setup (this generate prisma client and seed db):
  pnpm run setup

- Build all the packages and apps,:
  pnpm run build

- Run all the apps/packages dev scripts concurrently:
  pnpm run dev

OR

- Run only the Remix app:
  pnpm run dev --filter=${ORG_NAME}/remix-app
    `.trim()
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
    "fly.toml"
  );
  const EXAMPLE_ENV_PATH = path.join(rootDirectory, ".env.example");
  const ENV_PATH = path.join(rootDirectory, ".env");
  const PKG_PATH = path.join(rootDirectory, "package.json");
  const ESLINT_PATH = path.join(rootDirectory, ".eslintrc.js");
  const PRETTIER_PATH = path.join(rootDirectory, ".prettierrc.js");
  const DEPLOY_PATH = path.join(
    rootDirectory,
    ".github",
    "workflows",
    "deploy.yml"
  );
  const TURBO_PATH = path.join(rootDirectory, "turbo.json");
  const DOCKER_COMPOSE_PATH = path.join(rootDirectory, "docker-compose.yml");
  const globalOrgNameRegex = new RegExp(orgNameRegex, "g");

  const [
    flyTomlContent,
    readme,
    env,
    packageJson,
    eslint,
    prettier,
    githubCI,
    turbo,
    dockerCompose,
  ] = await Promise.all([
    fs.readFile(FLY_TOML_PATH, "utf-8"),
    fs.readFile(README_PATH, "utf-8"),
    fs.readFile(EXAMPLE_ENV_PATH, "utf-8"),
    fs.readFile(PKG_PATH, "utf-8"),
    fs.readFile(ESLINT_PATH, "utf-8"),
    fs.readFile(PRETTIER_PATH, "utf-8"),
    fs.readFile(DEPLOY_PATH, "utf-8"),
    fs.readFile(TURBO_PATH, "utf-8"),
    fs.readFile(DOCKER_COMPOSE_PATH, "utf-8"),
  ]);

  const newEnv = env.replace(
    /^SESSION_SECRET=.*$/m,
    `SESSION_SECRET="${getRandomString(16)}"`
  );
  const newFlyTomlContent = flyTomlContent.replace(
    new RegExp(appNameRegex, "g"),
    APP_NAME
  );
  const newPackageJson = packageJson
    .replace(globalOrgNameRegex, ORG_NAME)
    .replace(new RegExp(appNameRegex, "g"), APP_NAME);
  const newEslint = eslint.replace(globalOrgNameRegex, ORG_NAME);
  const newPrettier = prettier.replace(globalOrgNameRegex, ORG_NAME);
  const newReadme = readme
    .replace(globalOrgNameRegex, ORG_NAME)
    .replaceAll(new RegExp(appNameRegex, "g"), APP_NAME);
  const newGithubCI = githubCI.replace(globalOrgNameRegex, ORG_NAME);
  const newTurbo = turbo.replace(globalOrgNameRegex, ORG_NAME);
  const newDockerCompose = dockerCompose.replaceAll(
    "remix-gospel-stack-postgres",
    `${APP_NAME}-postgres`
  );

  const fileOperationPromises = [
    fs.writeFile(FLY_TOML_PATH, newFlyTomlContent),
    fs.writeFile(README_PATH, newReadme),
    fs.writeFile(ENV_PATH, newEnv),
    fs.writeFile(PKG_PATH, newPackageJson),
    fs.writeFile(ESLINT_PATH, newEslint),
    fs.writeFile(PRETTIER_PATH, newPrettier),
    fs.writeFile(DEPLOY_PATH, newGithubCI),
    fs.writeFile(TURBO_PATH, newTurbo),
    fs.writeFile(DOCKER_COMPOSE_PATH, newDockerCompose),
    fs.rm(path.join(rootDirectory, "LICENSE.md")),
    fs.rm(path.join(rootDirectory, "CONTRIBUTING.md")),
  ];

  await Promise.all(fileOperationPromises);
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
      path.join(rootDirectory, "apps", "**", "remix.config.mjs"),
      path.join(rootDirectory, "apps", "**", "Dockerfile"),
      path.join(rootDirectory, "apps", "**", ".eslintrc"),
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
      path.join(rootDirectory, "packages", "**", ".eslintrc.js"),
    ],
    from: new RegExp(orgNameRegex, "g"),
    to: ORG_NAME,
  });
};

module.exports = main;
