# Development Guide

This guide will help you set up your local development environment and understand the development workflow.

> **⚠️ Important:** All commands should be run from the **monorepo root directory** unless specified otherwise.

## Prerequisites

- **Node.js** (v22+ recommended)
- **pnpm** (required package manager)
- **Docker** (for local PostgreSQL database)
- **Git**

## Initial Setup

### 1. Install Dependencies

```bash
pnpm install
```

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

