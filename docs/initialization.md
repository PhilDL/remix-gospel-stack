# Initialization Guide

This guide explains how to initialize a new project from the React Router Gospel Stack template.

## Quick Start

After cloning or downloading the template:

```bash
pnpm install
pnpm run setup
```

The `setup` script runs an interactive setup that customizes the stack for your project.

## What the Setup Script Does

The setup script (`scripts/setup.mjs`) performs several important tasks:

### 1. Organization Name

Prompts you for your organization name (e.g., `@my-company` or `@acme-corp`).

This name is used throughout the monorepo:

- Package names: `@my-company/webapp`, `@my-company/ui`, etc.
- Import statements
- Configuration files
- Documentation

### 2. Database Selection

Asks which database you want to use:

**PostgreSQL**

- Traditional relational database
- Full Prisma migration support
- Docker setup for local development
- Fly.io PostgreSQL for production

**Turso (SQLite with libSQL)**

- Edge-optimized distributed SQLite
- Embedded replicas for local-first architecture
- Manual migration application (Prisma limitations)
- Lower operational overhead

### 3. File Updates

The script automatically updates:

- All `package.json` files with your organization name
- Import statements across the codebase
- `fly.toml` with your app name
- `README.md` files
- Configuration files (ESLint, TypeScript, etc.)
- GitHub Actions workflows

### 4. Environment Setup

Creates `.env` and `.env.docker` files from `.env.example`:

- Generates a secure random `SESSION_SECRET`
- Copies all other environment variables
- Ready for you to customize

### 5. Code Formatting

Runs Prettier to format all updated files consistently.

### 6. Lockfile Update

Updates `pnpm-lock.yaml` to ensure all dependencies are properly resolved.

## Running the Setup Script

### Using degit (Recommended)

```bash
# Download the template without git history
pnpm dlx degit PhilDL/react-router-gospel-stack my-app
cd my-app

# Install and initialize
pnpm install
pnpm run setup
```

### Alternative: Clone the Repository

```bash
# Clone with full git history
git clone https://github.com/PhilDL/react-router-gospel-stack.git my-app
cd my-app

# Install and initialize
pnpm install
pnpm run setup
```

## After Initialization

Once the init script completes, follow these steps to get your app running:

### For PostgreSQL with Drizzle (Default)

```bash
# 1. Start PostgreSQL container
pnpm run docker:db

# 2. Apply initial migrations
pnpm run db:migrate:apply

# 3. Build packages
pnpm run build --filter=@your-org/webapp...

# 4. Start dev server
pnpm run dev --filter=@your-org/webapp
```

Your app should now be running at `http://localhost:5173`

> 💡 **For more info:** See the [Database Guide](./database.md) for advanced PostgreSQL configuration and [Development Guide](./development.md) for detailed workflow information.

### For PostgreSQL with Prisma

```bash
# 1. Start PostgreSQL container
pnpm run docker:db

# 2. Generate Prisma client
pnpm run db:generate

# 3. Apply initial migrations
pnpm run db:migrate:apply

# 4. Build packages
pnpm run build --filter=@your-org/webapp...

# 5. Start dev server
pnpm run dev --filter=@your-org/webapp
```

Your app should now be running at `http://localhost:5173`

> 💡 **For more info:** See the [Database Guide](./database.md) for advanced PostgreSQL configuration and [Development Guide](./development.md) for detailed workflow information.

### For Turso with Drizzle (Default)

```bash
# 1. No setup needed - local SQLite file will be created automatically

# 2. Apply initial migrations
pnpm run db:migrate:apply

# 3. Build packages
pnpm run build --filter=@your-org/webapp...

# 4. Start dev server
pnpm run dev --filter=@your-org/webapp
```

Your app should now be running at `http://localhost:5173`

> 💡 **For more info:** See the [Database Guide](./database.md) for Turso production setup with embedded replicas and [Development Guide](./development.md) for detailed workflow information.

### For Turso with Prisma

```bash
# 1. No setup needed - local SQLite file will be created automatically

# 2. Generate Prisma client
pnpm run db:generate

# 3. Apply initial migrations
pnpm run db:migrate:apply

# 4. Build packages
pnpm run build --filter=@your-org/webapp...

# 5. Start dev server
pnpm run dev --filter=@your-org/webapp
```

Your app should now be running at `http://localhost:5173`

> 💡 **For more info:** See the [Database Guide](./database.md) for Turso production setup with embedded replicas and [Development Guide](./development.md) for detailed workflow information.

## Manual Setup (Without Init Script)

If you prefer to set up manually:

1. **Replace organization name:**

   ```bash
   find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" \) \
     -exec sed -i '' 's/@react-router-gospel-stack/@your-org/g' {} +
   ```

2. **Replace app name:**

   ```bash
   find . -type f -name "fly.toml" \
     -exec sed -i '' 's/react-router-gospel-stack/your-app-name/g' {} +
   ```

3. **Copy environment files:**

   ```bash
   cp .env.example .env
   cp .env.example .env.docker
   ```

4. **Generate SESSION_SECRET:**

   ```bash
   # Add to .env:
   SESSION_SECRET="$(openssl rand -hex 16)"
   ```

5. **Choose database:**
   Follow the [Database Guide](./database.md) to set up your chosen database.

## Troubleshooting

### "Command not found: node"

Install Node.js v22 or higher:

```bash
# Using nvm
nvm install 22
nvm use 22

# Or download from nodejs.org
```

### "Command not found: pnpm"

Follow the official pnpm installation guide: [https://pnpm.io/installation](https://pnpm.io/installation)

### Init Script Fails

If the init script fails:

1. Check you're in the project root directory
2. Ensure you've run `pnpm install` first
3. Check Node.js version: `node --version` (should be v22+)
4. Try running manually: `node scripts/setup.mjs`
5. Check the error message for specific issues

### Permission Denied

Make the script executable:

```bash
chmod +x scripts/setup.mjs
```

## Re-running Setup

You can re-run the setup script if needed, but be aware:

- **It will overwrite** your customizations
- **Backup your changes** first
- Consider manual edits for small changes

To re-run:

```bash
pnpm run setup
```

## Skipping Setup

If you're:

- Forking the repository for contributions
- Creating a stack variant
- Just exploring the code

You can skip initialization and use the default names:

```bash
pnpm install
pnpm run build
pnpm run dev --filter=@react-router-gospel-stack/webapp
```

### Changes from Previous Versions

This stack previously used Remix's automatic initialization system (`pnpm create remix@latest`). Since React Router v7+ doesn't support that system, we now use a standalone setup script that provides the similar functionalities to what was running in the remix.init folder.

## Next Steps

🎉 **You're all set!** Your app should be running.

**Optional reading to learn more:**

- **[Development Guide](./development.md)** - Learn about the development workflow, monorepo tools, and best practices
- **[Database Guide](./database.md)** - Deep dive into database operations, migrations, and switching ORMs
- **[Architecture](./architecture.md)** - Understand the monorepo structure and how packages work together
- **[Deployment](./deployment.md)** - When you're ready to deploy to production on Fly.io
- **[Testing Guide](./testing.md)** - Set up unit tests and E2E tests
- **[UI Package](./ui-package.md)** - Work with shadcn/ui components

**Start building!** 🚀
