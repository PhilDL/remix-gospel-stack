# Development Guide

This guide will help you set up your local development environment and understand the development workflow.

> **⚠️ Important:** All commands should be run from the **monorepo root directory** unless specified otherwise.

## Prerequisites

- **Node.js** (v22+ recommended)
- **pnpm** (required package manager)
- **Docker** (for local PostgreSQL database)
- **Git**

## Initial Setup

If you just cloned the repository, run the initialization script first:

```bash
pnpm run init
```

This interactive script will:

- Prompt for your organization name (e.g., `@my-company`)
- Let you choose between PostgreSQL or Turso database
- Update all package names throughout the monorepo
- Generate a secure SESSION_SECRET
- Copy `.env.example` to `.env` and `.env.docker`
- Format code and update the lockfile

> **Note:** This replaces the old `pnpm remix init` command that no longer works with React Router v7+.

### 1. Install Dependencies

```bash
pnpm install
```

## Understanding pnpm Catalogs

This monorepo uses [pnpm catalogs](https://pnpm.io/catalogs) to manage dependency versions centrally. This is a powerful workspace feature that helps maintain consistent versions across all packages.

### What are Catalogs?

Catalogs define dependency version ranges as reusable constants in the `pnpm-workspace.yaml` file. Instead of specifying version numbers in each `package.json`, packages can reference the catalog using the `catalog:` protocol.

**Example from `pnpm-workspace.yaml`:**

```yaml
catalog:
  isbot: 5.1.31
  chalk: 5.6.2
  dotenv: 17.2.3

catalogs:
  typescript:
    typescript: 5.9.3
    tsx: 4.20.6
    tsup: 8.5.0
  react19:
    react: 19.2.0
    react-dom: 19.2.0
    "@types/react": 19.2.2
  prisma:
    prisma: 6.18.0
    "@prisma/client": 6.18.0
```

### Using Catalogs in package.json

Instead of hard-coding versions, packages reference the catalog:

```json
{
  "dependencies": {
    "react": "catalog:react19",
    "typescript": "catalog:typescript",
    "chalk": "catalog:"
  }
}
```

### Benefits

1. **Single source of truth** - All versions defined in one place
2. **Easier upgrades** - Update one line to upgrade across all packages
3. **Fewer merge conflicts** - No need to update multiple `package.json` files
4. **Consistency** - Ensures all packages use the same versions

### Adding New Dependencies

When adding a dependency that should be shared across packages:

1. **Add to catalog** in `pnpm-workspace.yaml`:

   ```yaml
   catalog:
     my-new-package: ^1.0.0
   ```

2. **Reference in package.json**:
   ```bash
   pnpm add my-new-package@catalog: --filter @your-org/your-package
   ```

Or for a specific named catalog:

```bash
pnpm add typescript@catalog:typescript --filter @your-org/your-package
```

### Named Catalogs

The stack uses named catalogs to group related dependencies:

- **`typescript`** - TypeScript and build tools
- **`react19`** - React and related packages
- **`react-router`** - React Router framework
- **`tailwindcss`** - Tailwind and styling tools
- **`prisma`** - Prisma ORM packages
- **`hono`** - Server middleware

This organization makes it easy to upgrade entire technology stacks together.

### 2. Configure Environment Variables

Copy the example environment files:

```bash
cp .env.example .env
cp .env.example .env.docker
```

Edit `.env` to match your setup. See the [Database Guide](./database.md) for database-specific configuration.

### 3. Set Up Your Database

The setup differs based on your database choice. Follow the appropriate guide:

#### For PostgreSQL

Start the PostgreSQL Docker container:

```bash
pnpm run docker:db
```

> **Note:** The npm script will complete while Docker sets up the container in the background. Ensure that Docker has finished and your container is running before proceeding.

Generate Prisma schema:

```bash
pnpm run generate
```

Run Prisma migration:

```bash
pnpm run db:migrate:deploy
```

#### For Turso (SQLite)

For local development, use a simple local SQLite file:

```bash
# In your .env file
DATABASE_URL="file:./local.db"
# No need for DATABASE_SYNC_URL or DATABASE_AUTH_TOKEN in development
```

Generate Prisma schema:

```bash
pnpm run generate
```

**Important:** Prisma's automatic migrations don't work with Turso. See the [Database Guide](./database.md#prisma-migrations-with-turso) for manual migration steps.

### 4. Build the Project

Run the first build with dependencies:

```bash
pnpm run build --filter=@react-router-gospel-stack/webapp...
```

The `...` suffix tells Turborepo to also build all dependencies of the webapp.

> **Tip:** Running `pnpm run build` without filters will build everything in the monorepo.

### 5. Start Development Server

Start the React Router dev server:

```bash
pnpm run dev --filter=@react-router-gospel-stack/webapp
```

Your app should now be running at `http://localhost:5173` (or another port if 5173 is taken).

## Development Workflow

### Running the Development Server

```bash
# Run only the webapp
pnpm run dev --filter=@react-router-gospel-stack/webapp

# Run with dependencies in watch mode (recommended for package development)
pnpm run dev --filter=@react-router-gospel-stack/webapp...
```

### Building Packages

```bash
# Build everything
pnpm run build

# Build specific package
pnpm run build --filter=@react-router-gospel-stack/ui

# Build package and its dependencies
pnpm run build --filter=@react-router-gospel-stack/webapp...
```

### Installing Packages

To install an npm package in a specific workspace:

```bash
# Install in the webapp
pnpm add dayjs --filter @react-router-gospel-stack/webapp

# Install in the ui package
pnpm add lucide-react --filter @react-router-gospel-stack/ui

# Install in workspace root
pnpm add -w <package-name>
```

### Creating New Packages

#### Internal Package (no build step)

```bash
turbo gen workspace --name @react-router-gospel-stack/foobarbaz --type package --copy
```

Then follow the prompts. See the `internal-nobuild` package as an example.

#### Built Package

Use one of the existing packages (`ui`, `database`, `business`) as a template and copy its structure.

## Understanding Turborepo Pipelines

Turborepo caches task outputs to speed up your workflow. Check `turbo.json` at the monorepo root to see available pipelines:

- `build` - Build packages and apps
- `dev` - Start development servers
- `lint` - Run ESLint
- `typecheck` - Run TypeScript compiler
- `test` - Run unit tests
- `test:e2e:dev` - Run Playwright e2e tests

### Cache Benefits

Once a task completes, Turborepo caches its output. If you run the same task again without changing relevant files, it will be instant!

## Working with the Database

### Generate Prisma Client

After changing the Prisma schema:

```bash
pnpm run generate
```

### Create a Migration

**For PostgreSQL:**

```bash
pnpm run db:migrate:dev
```

**For Turso:**

1. Generate the migration:

   ```bash
   pnpm run db:migrate:dev
   ```

2. Apply it manually to your Turso database:
   ```bash
   turso db shell <database-name> < packages/database/prisma/migrations/<migration-folder>/migration.sql
   ```

See the [Database Guide](./database.md) for more details.

### Switching Databases

To switch between PostgreSQL and Turso:

```bash
pnpm turbo gen scaffold-database
```

Follow the prompts. **Note:** You'll need to delete the `packages/database/prisma/migrations` folder when switching.

## Docker Development

### Build and Run with Docker

```bash
# Create docker network (first time only)
docker network create app_network

# Build the webapp docker image
pnpm docker:build:webapp

# Run the docker image
pnpm docker:run:webapp
```

## Configuration Files

### TypeScript

TypeScript configurations are in the `config/tsconfig` package:

- `base.json` - Base config
- `react.json` - For React apps
- `node22.json` - For Node.js projects

Apps and packages extend these configs in their `tsconfig.json`:

```json
{
  "extends": "@react-router-gospel-stack/tsconfig/react.json",
  "compilerOptions": {
    // ... specific overrides
  }
}
```

### ESLint

ESLint configurations are in the `config/eslint` package:

- `base.js` - Base rules
- `react-router.js` - React Router specific rules
- `plugin.js` - Custom ESLint plugin

Apps and packages extend these configs in their `eslint.config.js`:

```js
import baseConfig from "@react-router-gospel-stack/eslint-config/base";

export default [
  ...baseConfig,
  // ... specific rules
];
```

### Tailwind CSS

Tailwind configuration is in the `config/tailwind` package, exported as a Tailwind plugin and preset.

The `ui` package defines the design system theme and exports it for use in other packages.

## Development Tips

### Hot Module Replacement (HMR)

React Router's dev server supports HMR. Changes to your code will be reflected immediately in the browser.

### TypeScript Paths

The monorepo uses TypeScript path mappings for internal packages. This allows you to import from packages without building them first during development:

```typescript
import { db } from "@react-router-gospel-stack/database";
```

React Router's build step handles compiling these dependencies.

### Monorepo Best Practices

1. **Always install from root** - Run `pnpm install` from the monorepo root
2. **Use filters** - Leverage `--filter` to run commands on specific packages
3. **Build dependencies** - Use the `...` suffix to include dependencies: `--filter=webapp...`
4. **Cache awareness** - Turborepo caches based on file changes. Commit often to avoid cache invalidation

### Common Issues

#### Build Errors After Installing a Package

If you see build errors after installing a package, try:

```bash
pnpm run generate
pnpm run build --filter=@react-router-gospel-stack/webapp...
```

#### Port Already in Use

If port 5173 is already in use, React Router will automatically try the next available port.

#### Docker Database Not Starting

Ensure Docker Desktop is running and check container status:

```bash
docker ps
```

## Next Steps

- Learn about the [Architecture](./architecture.md) of the monorepo
- Configure your [Database](./database.md) for production
- Set up [Testing](./testing.md) in your workflow
- Prepare for [Deployment](./deployment.md) to Fly.io
