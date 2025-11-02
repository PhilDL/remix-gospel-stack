#!/usr/bin/env node

/**
 * React Router Gospel Stack Setup Script
 * 
 * This script handles the initial setup of the monorepo after cloning.
 * It replaces the old Remix init system that's no longer supported in React Router v7+.
 * 
 * Run this script after cloning:
 * node scripts/setup.mjs
 */

import { execSync } from "child_process";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDirectory = path.resolve(__dirname, "..");

const escapeRegExp = (string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getRandomString = (length) => crypto.randomBytes(length).toString("hex");

const spaces = (count = 6) => Array(count).fill(" ").join("");

async function main() {
  console.log(chalk.bold.cyan("\n🎉 React Router Gospel Stack Setup\n"));

  const appNameRegex = escapeRegExp("react-router-gospel-stack");
  const orgNameRegex = escapeRegExp("@react-router-gospel-stack");

  const DIR_NAME = path.basename(rootDirectory);
  const SUFFIX = getRandomString(2);

  const APP_NAME = DIR_NAME.replace(/[^a-zA-Z0-9-_]/g, "-");

  // Prompt for organization name
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

  // Prompt for database choice
  const { db } = await inquirer.prompt([
    {
      name: "db",
      type: "list",
      message: `Which database do you want to use? (Deployed to Fly.io)`,
      choices: [
        { name: `${spaces(6)}PostgreSQL`, value: "postgres" },
        {
          name: `${spaces(6)}Turso (SQLite with libSQL)`,
          value: "turso",
        },
      ],
      default: "postgres",
      prefix: `${spaces(6)}◼ `,
    },
  ]);

  console.log(`${spaces()}◼  Preparing monorepo for ${db}...`);
  
  // Run database scaffold generator
  try {
    execSync(
      `pnpm turbo gen scaffold-database --args ${ORG_NAME}/webapp webapp ${db}`,
      {
        cwd: rootDirectory,
        stdio: "inherit",
      }
    );
  } catch (error) {
    console.error(chalk.red("Failed to scaffold database. Continuing..."));
  }

  // Rename webapp directory if APP_NAME is different
  if (APP_NAME !== "webapp") {
    console.log(`${spaces()}◼  Renaming webapp to ${APP_NAME}...`);
    const oldWebappPath = path.join(rootDirectory, "apps", "webapp");
    const newWebappPath = path.join(rootDirectory, "apps", APP_NAME);
    try {
      await fs.rename(oldWebappPath, newWebappPath);
      console.log(`${spaces()}${chalk.green(`✔  Renamed apps/webapp to apps/${APP_NAME}`)}`);
    } catch (error) {
      console.error(chalk.red(`Failed to rename webapp directory: ${error.message}`));
    }
  }

  // Update configuration files
  await updateRootConfigs({
    rootDirectory,
    orgNameRegex,
    appNameRegex,
    ORG_NAME,
    APP_NAME,
  });

  // Update all package references
  await updateAllPackages({
    rootDirectory,
    orgNameRegex,
    appNameRegex,
    ORG_NAME,
    APP_NAME,
  });

  console.log(`\n${spaces()}${chalk.green(
    `✔  ${chalk.bold(ORG_NAME)} app and packages setup complete.`
  )}\n`);

  // Copy and configure .env file
  await setupEnvFile({ rootDirectory });

  // Format code
  console.log(`${spaces()}◼  Formatting code...`);
  try {
    execSync("pnpm run format", {
      cwd: rootDirectory,
      stdio: "ignore",
    });
  } catch (error) {
    console.log(chalk.yellow(`${spaces()}⚠️  Could not run formatter (skipping)`));
  }

  // Fix lockfile
  console.log(`${spaces()}◼  Updating lockfile...`);
  execSync("pnpm i --fix-lockfile", { 
    cwd: rootDirectory, 
    stdio: "ignore" 
  });

  // Print next steps
  printNextSteps(db, ORG_NAME, APP_NAME, rootDirectory);
}

async function updateRootConfigs({
  rootDirectory,
  orgNameRegex,
  appNameRegex,
  ORG_NAME,
  APP_NAME,
}) {
  const appDir = APP_NAME || "webapp";
  const files = {
    flyToml: path.join(rootDirectory, "apps", appDir, "fly.toml"),
    readme: path.join(rootDirectory, "README.md"),
    packageJson: path.join(rootDirectory, "package.json"),
    prettier: path.join(rootDirectory, ".prettierrc.js"),
    deploy: path.join(rootDirectory, ".github", "workflows", "deploy.yml"),
    turbo: path.join(rootDirectory, "turbo.json"),
  };

  const globalOrgNameRegex = new RegExp(orgNameRegex, "g");
  const globalAppNameRegex = new RegExp(appNameRegex, "g");

  // Read all files
  const contents = {};
  for (const [key, filePath] of Object.entries(files)) {
    try {
      contents[key] = await fs.readFile(filePath, "utf-8");
    } catch (error) {
      console.log(chalk.yellow(`${spaces()}⚠️  Could not read ${filePath} (skipping)`));
      contents[key] = null;
    }
  }

  // Update contents
  const updates = {};
  if (contents.flyToml) {
    updates.flyToml = contents.flyToml.replace(globalAppNameRegex, APP_NAME);
  }
  if (contents.packageJson) {
    updates.packageJson = contents.packageJson
      .replace(globalOrgNameRegex, ORG_NAME)
      .replace(globalAppNameRegex, APP_NAME);
  }
  if (contents.prettier) {
    updates.prettier = contents.prettier.replace(globalOrgNameRegex, ORG_NAME);
  }
  if (contents.readme) {
    updates.readme = contents.readme
      .replace(globalOrgNameRegex, ORG_NAME)
      .replace(globalAppNameRegex, APP_NAME);
  }
  if (contents.deploy) {
    updates.deploy = contents.deploy.replace(globalOrgNameRegex, ORG_NAME);
  }
  if (contents.turbo) {
    updates.turbo = contents.turbo.replace(globalOrgNameRegex, ORG_NAME);
  }

  // Handle docker-compose.yml
  try {
    const dockerComposePath = path.join(rootDirectory, "docker-compose.yml");
    const dockerCompose = await fs.readFile(dockerComposePath, "utf-8");
    updates.dockerCompose = dockerCompose.replace(
      /react-router-gospel-stack-postgres/g,
      `${APP_NAME}-postgres`
    );
    files.dockerCompose = dockerComposePath;
  } catch (error) {
    // File doesn't exist, skip
  }

  // Write all files
  const writePromises = Object.entries(updates).map(([key, content]) =>
    fs.writeFile(files[key], content)
  );

  // Remove LICENSE and CONTRIBUTING (user should add their own)
  writePromises.push(
    fs.rm(path.join(rootDirectory, "LICENSE.md"), { force: true }),
    fs.rm(path.join(rootDirectory, "CONTRIBUTING.md"), { force: true })
  );

  await Promise.all(writePromises);
}

async function setupEnvFile({ rootDirectory }) {
  const EXAMPLE_ENV_PATH = path.join(rootDirectory, ".env.example");
  const ENV_PATH = path.join(rootDirectory, ".env");
  const ENV_DOCKER_PATH = path.join(rootDirectory, ".env.docker");

  try {
    const env = await fs.readFile(EXAMPLE_ENV_PATH, "utf-8");
    const newEnv = env.replace(
      /^SESSION_SECRET=.*$/m,
      `SESSION_SECRET="${getRandomString(16)}"`
    );
    
    await fs.writeFile(ENV_PATH, newEnv);
    await fs.writeFile(ENV_DOCKER_PATH, newEnv);
    
    console.log(`${spaces()}${chalk.green("✔  Created .env and .env.docker files")}`);
  } catch (error) {
    console.log(chalk.yellow(`${spaces()}⚠️  Could not create .env files (you may need to copy .env.example manually)`));
  }
}

async function updateAllPackages({
  rootDirectory,
  orgNameRegex,
  appNameRegex,
  ORG_NAME,
  APP_NAME,
}) {
  const globalOrgNameRegex = new RegExp(orgNameRegex, "g");
  const globalAppNameRegex = new RegExp(appNameRegex, "g");

  const replacements = [
    {
      paths: [
        "apps/**/*.json",
        "apps/**/*.js",
        "apps/**/*.ts",
        "apps/**/*.tsx",
        "apps/**/vite.config.ts",
        "apps/**/Dockerfile",
        "apps/**/eslint.config.js",
        "apps/**/README.md",
      ],
      pattern: globalOrgNameRegex,
      replacement: ORG_NAME,
    },
    {
      paths: ["apps/**/package.json"],
      pattern: globalAppNameRegex,
      replacement: APP_NAME,
    },
    {
      paths: [
        "config/**/*.json",
        "config/**/*.js",
      ],
      pattern: globalOrgNameRegex,
      replacement: ORG_NAME,
    },
    {
      paths: [
        "packages/**/*.json",
        "packages/**/*.js",
        "packages/**/*.ts",
        "packages/**/*.tsx",
        "packages/**/eslint.config.js",
      ],
      pattern: globalOrgNameRegex,
      replacement: ORG_NAME,
    },
  ];

  for (const { paths, pattern, replacement } of replacements) {
    for (const globPattern of paths) {
      const fullPath = path.join(rootDirectory, globPattern);
      try {
        // Use simple file replacement instead of replace-in-file
        await replaceInFiles(fullPath, pattern, replacement);
      } catch (error) {
        // Continue on errors
      }
    }
  }
}

async function replaceInFiles(globPattern, searchPattern, replacement) {
  const { glob } = await import("glob");
  
  try {
    const files = await glob(globPattern, {
      ignore: ["**/node_modules/**", "**/dist/**", "**/.turbo/**", "**/build/**"],
      nodir: true,
    });

    for (const file of files) {
      try {
        const content = await fs.readFile(file, "utf-8");
        const newContent = content.replace(searchPattern, replacement);
        
        if (content !== newContent) {
          await fs.writeFile(file, newContent, "utf-8");
        }
      } catch (error) {
        // Skip files that can't be read or written
        console.log(chalk.yellow(`${spaces()}⚠️  Could not update ${file}`));
      }
    }
  } catch (error) {
    // Continue on glob errors
  }
}

function printNextSteps(db, ORG_NAME, APP_NAME, rootDirectory) {
  console.log(
    chalk.green(`
${spaces()}✔  Setup is complete! Follow these steps to start developing:
`)
  );

  console.log(`${spaces(9)}1. Install dependencies:
${spaces(12)}${chalk.yellow("pnpm install")}
`);

  if (db === "postgres") {
    console.log(`${spaces(9)}2. Start PostgreSQL:
${spaces(12)}${chalk.yellow("pnpm run docker:db")}

${spaces(9)}3. Generate Prisma client and run migrations:
${spaces(12)}${chalk.yellow("pnpm run generate")}
${spaces(12)}${chalk.yellow("pnpm run db:migrate:deploy")}

${spaces(9)}4. Build packages:
${spaces(12)}${chalk.yellow(`pnpm run build --filter=${ORG_NAME}/${APP_NAME}...`)}

${spaces(9)}5. Start development server:
${spaces(12)}${chalk.yellow(`pnpm run dev --filter=${ORG_NAME}/${APP_NAME}`)}
`);
  } else {
    console.log(`${spaces(9)}2. Configure your .env file for Turso:
${spaces(12)}${chalk.cyan("DATABASE_URL")}=file:./local.db

${spaces(9)}3. Generate Prisma client:
${spaces(12)}${chalk.yellow("pnpm run generate")}

${spaces(9)}4. Create and apply migrations manually:
${spaces(12)}${chalk.yellow("pnpm run db:migrate:dev")}
${spaces(12)}${chalk.yellow("sqlite3 local.db < packages/database/prisma/migrations/<folder>/migration.sql")}

${spaces(9)}5. Build packages:
${spaces(12)}${chalk.yellow(`pnpm run build --filter=${ORG_NAME}/${APP_NAME}...`)}

${spaces(9)}6. Start development server:
${spaces(12)}${chalk.yellow(`pnpm run dev --filter=${ORG_NAME}/${APP_NAME}`)}

${spaces()}${chalk.cyan("ℹ️  Turso Notes:")}
${spaces()}   - For local dev: DATABASE_URL=file:./local.db (no auth needed)
${spaces()}   - For production: Use embedded replicas with DATABASE_SYNC_URL and DATABASE_AUTH_TOKEN
${spaces()}   - Prisma migrations must be applied manually: turso db shell <db> < migration.sql
${spaces()}   - See docs/database.md for full details
`);
  }

  console.log(`${spaces()}${chalk.cyan("📚 Documentation:")}
${spaces()}   - Development: ${chalk.underline("docs/development.md")}
${spaces()}   - Database: ${chalk.underline("docs/database.md")}
${spaces()}   - Deployment: ${chalk.underline("docs/deployment.md")}
${spaces()}   - Architecture: ${chalk.underline("docs/architecture.md")}
`);
}

main().catch((error) => {
  console.error(chalk.red("\n❌ Setup failed:"), error);
  process.exit(1);
});

