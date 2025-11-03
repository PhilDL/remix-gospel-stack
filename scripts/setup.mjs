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
import { glob } from "glob";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDirectory = path.resolve(__dirname, "..");

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

  // Prompt for database choice first
  const { db } = await inquirer.prompt([
    {
      name: "db",
      type: "list",
      message: `Which database do you want to use?`,
      choices: [
        {
          name: `${spaces(6)}Turso (SQLite with libSQL) - recommended`,
          value: "turso",
        },
        { name: `${spaces(6)}PostgreSQL`, value: "postgres" },
      ],
      default: "turso",
      prefix: `${spaces(6)}◼ `,
    },
  ]);

  // Then prompt for ORM choice
  const { orm } = await inquirer.prompt([
    {
      name: "orm",
      type: "list",
      message: `Which ORM do you want to use with ${db === "turso" ? "Turso" : "PostgreSQL"}?`,
      choices: [
        { name: `${spaces(6)}Drizzle - recommended`, value: "drizzle" },
        { name: `${spaces(6)}Prisma`, value: "prisma" },
      ],
      default: "drizzle",
      prefix: `${spaces(6)}◼ `,
    },
  ]);

  console.log(
    `${spaces()}◼  Preparing monorepo with ${db === "turso" ? "Turso" : "PostgreSQL"} + ${orm === "drizzle" ? "Drizzle" : "Prisma"}...`,
  );

  // Run database scaffold generator
  try {
    execSync(
      `pnpm turbo gen scaffold-database --args ${ORG_NAME}/webapp webapp ${db} ${orm}`,
      {
        cwd: rootDirectory,
        stdio: "inherit",
      },
    );
  } catch (error) {
    console.error(chalk.red("Failed to scaffold database. Continuing..."));
  }

  const globalOrgNameRegex = new RegExp(orgNameRegex, "g");
  const globalAppNameRegex = new RegExp(appNameRegex, "g");

  // Update configuration files
  await processFilesWithGlobs({
    rootDirectory,
    replacements: [
      {
        glob: "{package.json,.prettierrc.js,turbo.json}",
        replacer: (content) =>
          content
            .replace(globalOrgNameRegex, ORG_NAME)
            .replace(globalAppNameRegex, APP_NAME),
      },
      {
        glob: "{package.json,README.md}",
        replacer: (content) =>
          content
            .replace(globalOrgNameRegex, ORG_NAME)
            .replace(globalAppNameRegex, APP_NAME),
      },
      {
        glob: `apps/${APP_NAME}/fly.toml`,
        replacer: (content) =>
          content
            .replace(globalOrgNameRegex, ORG_NAME)
            .replace(globalAppNameRegex, APP_NAME),
      },
      {
        glob: ".github/workflows/deploy.yml",
        replacer: (content) =>
          content
            .replace(globalOrgNameRegex, ORG_NAME)
            .replace(globalAppNameRegex, APP_NAME),
      },
      {
        glob: "docker-compose.yml",
        replacer: (content) =>
          content.replace(
            /react-router-gospel-stack-postgres/g,
            `${APP_NAME}-postgres`,
          ),
      },
    ],
    filesToRemove: ["LICENSE.md", "CONTRIBUTING.md"],
  });

  // Update all package references
  await processFilesWithGlobs({
    rootDirectory,
    replacements: [
      {
        glob: "apps/**/*.{json,js,ts,tsx,md}",
        replacer: (content) =>
          content
            .replace(globalOrgNameRegex, ORG_NAME)
            .replace(globalAppNameRegex, APP_NAME),
      },
      {
        glob: "packages/**/*.{json,js,ts,tsx,md}",
        replacer: (content) =>
          content
            .replace(globalOrgNameRegex, ORG_NAME)
            .replace(globalAppNameRegex, APP_NAME),
      },
      {
        glob: "config/**/*.{json,js,ts,tsx,md}",
        replacer: (content) =>
          content
            .replace(globalOrgNameRegex, ORG_NAME)
            .replace(globalAppNameRegex, APP_NAME),
      },
    ],
    filesToRemove: [],
  });

  console.log(
    `\n${spaces()}${chalk.green(
      `✔  ${chalk.bold(ORG_NAME)} app and packages setup complete.`,
    )}\n`,
  );

  // Copy and configure .env file
  await setupEnvFile({
    rootDirectory,
    replacer: (content) =>
      content.replace(
        /^SESSION_SECRET=.*$/m,
        `SESSION_SECRET="${getRandomString(16)}"`,
      ),
  });

  // Format code
  console.log(`${spaces()}◼  Formatting code...`);
  try {
    execSync("pnpm run format", {
      cwd: rootDirectory,
      stdio: "ignore",
    });
  } catch (error) {
    console.log(
      chalk.yellow(`${spaces()}⚠️  Could not run formatter (skipping)`),
    );
  }

  // Fix lockfile
  console.log(`${spaces()}◼  Installing dependencies...`);
  execSync("pnpm i --fix-lockfile", {
    cwd: rootDirectory,
    stdio: "ignore",
  });
  // Generate ORM client
  if (orm === "drizzle") {
    console.log(`${spaces()}◼  Generating Drizzle migrations...`);
    try {
      execSync("pnpm db:generate", {
        cwd: rootDirectory,
        stdio: "ignore",
      });
    } catch (error) {
      console.log(
        chalk.yellow(`${spaces()}⚠️  Could not generate migrations (skipping)`),
      );
    }
  } else {
    console.log(`${spaces()}◼  Generating Prisma client...`);
    execSync("pnpm prisma:generate", {
      cwd: rootDirectory,
      stdio: "ignore",
    });
  }

  // Print next steps
  printNextSteps(db, orm, ORG_NAME, APP_NAME, rootDirectory);
}

/**
 * Find all .env.example files and copy them to .env in their respective directories
 * @param {Object} options
 * @param {string} options.rootDirectory - Base directory for resolving paths
 * @param {(content: string) => string} [options.replacer] - Optional function to transform env file content
 */
async function setupEnvFile({ rootDirectory, replacer }) {
  try {
    const envExampleFiles = await glob("**/.env.example", {
      cwd: rootDirectory,
      absolute: true,
      ignore: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.turbo/**",
        "**/build/**",
      ],
      nodir: true,
    });

    if (envExampleFiles.length === 0) {
      console.log(chalk.yellow(`${spaces()}⚠️  No .env.example files found`));
      return;
    }

    const writePromises = [];
    const successfulFiles = [];
    const failedFiles = [];

    for (const examplePath of envExampleFiles) {
      try {
        const envPath = examplePath.replace(".env.example", ".env");
        let content = await fs.readFile(examplePath, "utf-8");

        // Apply replacer function if provided
        if (replacer && typeof replacer === "function") {
          content = replacer(content);
        }

        writePromises.push(
          fs
            .writeFile(envPath, content, "utf-8")
            .then(() => {
              successfulFiles.push(path.relative(rootDirectory, envPath));
            })
            .catch(() => {
              failedFiles.push(path.relative(rootDirectory, envPath));
            }),
        );
      } catch (error) {
        failedFiles.push(path.relative(rootDirectory, examplePath));
      }
    }

    await Promise.all(writePromises);

    if (successfulFiles.length > 0) {
      console.log(
        `${spaces()}${chalk.green(`✔  Created ${successfulFiles.length} .env file(s):`)}`,
      );
      successfulFiles.forEach((file) => {
        console.log(`${spaces(9)}${chalk.dim(file)}`);
      });
    }

    if (failedFiles.length > 0) {
      console.log(
        chalk.yellow(
          `${spaces()}⚠️  Could not create ${failedFiles.length} .env file(s) (you may need to copy manually)`,
        ),
      );
    }
  } catch (error) {
    console.log(
      chalk.yellow(
        `${spaces()}⚠️  Could not create .env files (you may need to copy .env.example manually)`,
      ),
    );
  }
}

function printNextSteps(db, orm, ORG_NAME, APP_NAME, rootDirectory) {
  const dbName = db === "turso" ? "Turso" : "PostgreSQL";
  const ormName = orm === "drizzle" ? "Drizzle" : "Prisma";

  console.log(
    chalk.green(`
${spaces()}✔  Setup complete! Your stack: ${dbName} + ${ormName}
${spaces()}
${spaces()}📋 Next steps to start developing:
`),
  );

  if (db === "postgres") {
    console.log(`${spaces(9)}1. Start PostgreSQL:
${spaces(12)}${chalk.yellow("pnpm run docker:db")}

${spaces(9)}2. Apply database schema:
${spaces(12)}${chalk.yellow(orm === "drizzle" ? "pnpm run db:push" : "pnpm run prisma:migrate:deploy")}

${spaces(9)}3. Build packages:
${spaces(12)}${chalk.yellow(`pnpm run build --filter=${ORG_NAME}/webapp...`)}

${spaces(9)}4. Start development server:
${spaces(12)}${chalk.yellow(`pnpm run dev --filter=${ORG_NAME}/webapp`)}
`);
  } else {
    console.log(`${spaces(9)}1. Your .env file is configured for local Turso:
${spaces(12)}${chalk.cyan("DATABASE_URL")}=file:./local.db

${spaces(9)}2. Apply database schema:
${spaces(12)}${chalk.yellow(orm === "drizzle" ? "pnpm run db:push" : "pnpm run prisma:generate && pnpm run prisma:push")}

${spaces(9)}3. Build packages:
${spaces(12)}${chalk.yellow(`pnpm run build --filter=${ORG_NAME}/webapp...`)}

${spaces(9)}4. Start development server:
${spaces(12)}${chalk.yellow(`pnpm run dev --filter=${ORG_NAME}/webapp`)}

${spaces()}${chalk.cyan("💡 Turso Tips:")}
${spaces()}   - Local dev uses a simple SQLite file (no remote connection needed)
${spaces()}   - For production: Add DATABASE_SYNC_URL and DATABASE_AUTH_TOKEN
${orm === "prisma" ? `${spaces()}   - Prisma + Turso requires manual migration application\n` : ""}${spaces()}   - See docs/database.md and docs/why-drizzle-over-prisma.md
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

/**
 * Process files matching glob patterns with custom replacer functions
 * @param {Object} options
 * @param {string} options.rootDirectory - Base directory for resolving paths
 * @param {Array<{glob: string, replacer: (content: string) => string}>} options.replacements - Array of glob patterns and replacer functions
 * @param {Array<string>} [options.filesToRemove] - Optional array of file paths to remove
 */
async function processFilesWithGlobs({
  rootDirectory,
  replacements,
  filesToRemove = [],
}) {
  const writePromises = [];

  // Process each glob pattern
  for (const { glob: pattern, replacer } of replacements) {
    try {
      const files = await glob(pattern, {
        cwd: rootDirectory,
        absolute: true,
        ignore: [
          "**/node_modules/**",
          "**/dist/**",
          "**/.turbo/**",
          "**/build/**",
        ],
        nodir: true,
      });

      for (const filePath of files) {
        try {
          const content = await fs.readFile(filePath, "utf-8");
          const newContent = replacer(content);

          if (content !== newContent) {
            writePromises.push(fs.writeFile(filePath, newContent, "utf-8"));
          }
        } catch (error) {
          console.log(
            chalk.yellow(
              `${spaces()}⚠️  Could not process ${filePath} (skipping)`,
            ),
          );
        }
      }
    } catch (error) {
      console.log(
        chalk.yellow(`${spaces()}⚠️  No files found for pattern: ${pattern}`),
      );
    }
  }

  // Remove files if specified
  for (const filePath of filesToRemove) {
    writePromises.push(
      fs.rm(path.join(rootDirectory, filePath), { force: true }),
    );
  }

  await Promise.all(writePromises);
}
