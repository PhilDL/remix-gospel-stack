# Database Guide

This stack supports two database options: **PostgreSQL**, and **Turso** for edge-optimized SQLite with embedded replicas that promotes the one-database-per-tenant architecture.

> **Future:** We plan to support choosing between Prisma and Drizzle ORM during setup.

## Choosing a Database

During the initial setup, you choose between:

1. **PostgreSQL**
   - Multi-region support via Fly.io PostgreSQL clusters
   - Full Prisma migration support
   - Familiar for most developers

2. **Turso Cloud**
   - LibSQL flavor of SQLite with generous free tiers
   - Instant reads with embedded replicas (copy of the database on the volume)
   - Automatic sync between local and remote database
   - Writes go to the remote database first, then sync locally
   - Built-in backups and point-in-time recovery
   - Prisma doesn't support libSQL migrations, you have to apply them manually.
   - We used to have LiteFS here but since I was not using it in production, I switched to Turso. See [Why Turso instead of LiteFS?](./why-turso-instead-of-litefs.md)

## Switching Between Databases

You can switch between PostgreSQL and Turso at any time using the Turborepo generator:

```bash
pnpm turbo gen scaffold-database
```

Follow the prompts to select your desired database.

> **⚠️ Important:** When switching databases, you must delete the `packages/database/prisma/migrations` folder since Prisma migrations are database-specific.

After switching, run the setup again:

```bash
pnpm run generate
pnpm run db:migrate:dev  # Create a new initial migration
```

## Turso Setup

### Local Development

For local development, use a simple local SQLite file—no remote connection needed.

#### 1. Configure Environment Variables

In your `.env` file:

```bash
DATABASE_URL="file:./local.db"
# No need for DATABASE_SYNC_URL or DATABASE_AUTH_TOKEN in development
```

#### 2. Generate Prisma Client

```bash
pnpm run generate
```

#### 3. Apply Migrations Manually

**Important:** Prisma's automatic migrations don't work with libSQL/Turso. You must manually apply SQL migration files.

```bash
# Create the migration (generates SQL file)
pnpm run db:migrate:dev

# Apply it to your local database using sqlite3 or turso CLI
sqlite3 local.db < packages/database/prisma/migrations/<migration-folder>/migration.sql
```

### Prisma Migrations with Turso

Since Prisma's `migrate deploy` command doesn't support libSQL/Turso, follow this workflow:

#### Creating Migrations

1. Modify your Prisma schema as needed
2. Generate the migration:
   ```bash
   pnpm run db:migrate:dev
   ```
3. Prisma creates SQL files in `packages/database/prisma/migrations/<timestamp>_<name>/migration.sql`

#### Applying Migrations Locally

```bash
sqlite3 local.db < packages/database/prisma/migrations/<migration-folder>/migration.sql
```

Or with Turso CLI:

```bash
turso db shell local < packages/database/prisma/migrations/<migration-folder>/migration.sql
```

#### Applying Migrations to Production

For production Turso databases:

```bash
turso db shell <database-name> < packages/database/prisma/migrations/<migration-folder>/migration.sql
```

> **Tip:** For the initial setup, you'll typically have a migration like `20251027155525_first/migration.sql`. Apply each new migration SQL file in order.

### Production Setup with Turso

#### 1. Install Turso CLI

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

#### 2. Login to Turso

```bash
turso auth login
```

#### 3. Create a Database Group

Database groups allow you to create multiple databases that share the same schema:

```bash
turso group create <group-name>
```

#### 4. Create Production Database

```bash
turso db create <database-name> --group <group-name>
```

#### 5. Get Database Credentials

```bash
# Get the database URL (sync URL for embedded replicas)
turso db show --url <database-name>

# Create an auth token
turso db tokens create <database-name>
```

Save these for your production environment configuration.

#### 6. Apply Initial Migration

```bash
turso db shell <database-name> < packages/database/prisma/migrations/<initial-migration>/migration.sql
```

### Embedded Replicas

Turso's embedded replicas provide local-first resilience with automatic syncing to the remote database.

#### How It Works

1. **Local SQLite file** serves reads (fast, disk-based)
2. **Automatic sync** with remote Turso database
3. **Writes** go to the remote database first, then sync locally
4. **Offline resilience** - reads work even if remote is unavailable

#### Configuration

In `apps/webapp/app/db.server.ts`:

```typescript
import { createClient } from "@react-router-gospel-stack/database";

export const db = remember("db", () => {
  return createClient({
    url: env.DATABASE_URL, // Local file path or remote URL
    authToken: env.DATABASE_AUTH_TOKEN, // Optional in dev
    syncUrl: env.DATABASE_SYNC_URL, // Optional in dev
  });
});
```

**Environment variables:**

```bash
# Development (local SQLite only)
DATABASE_URL="file:./local.db"

# Production with embedded replicas
DATABASE_URL="file:/data/libsql/local.db"      # Local replica path
DATABASE_SYNC_URL="libsql://[db].turso.io"     # Remote Turso URL
DATABASE_AUTH_TOKEN="eyJhbG..."                 # Turso auth token
```

> **Note:** In development, omitting `DATABASE_SYNC_URL` and `DATABASE_AUTH_TOKEN` gives you a purely local SQLite database.

For Fly.io deployment with embedded replicas, see the [Deployment Guide](./deployment.md#turso-deployment).

## PostgreSQL Setup

### Local Development

#### 1. Start the Database

Use the provided Docker Compose setup:

```bash
pnpm run docker:db
```

This starts a PostgreSQL container with the configuration from `.env.docker`.

#### 2. Configure Environment Variables

In your `.env` file:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/remix_gospel"
```

#### 3. Run Migrations

```bash
# Generate Prisma Client
pnpm run generate

# Deploy migrations
pnpm run db:migrate:deploy
```

#### 4. (Optional) Seed the Database

```bash
pnpm run db:seed
```

### Creating Migrations

When you change the Prisma schema (`packages/database/prisma/schema.prisma`):

```bash
# Create a new migration
pnpm run db:migrate:dev

# Give it a descriptive name when prompted
```

This will:

1. Generate SQL migration files
2. Apply the migration to your local database
3. Regenerate the Prisma Client

### Production Setup

For production PostgreSQL on Fly.io, see the [Deployment Guide](./deployment.md#postgresql-deployment).

## Working with Prisma

### Prisma Studio

Launch Prisma Studio to view and edit your database:

```bash
pnpm --filter @react-router-gospel-stack/database prisma studio
```

### Prisma Client

The `@react-router-gospel-stack/database` package exports a configured Prisma Client:

```typescript
import { db } from "@react-router-gospel-stack/database";

// Use in your React Router loaders/actions
export async function loader() {
  const users = await db.user.findMany();
  return json({ users });
}
```

### Schema Location

The Prisma schema is located at:

```
packages/database/prisma/schema.prisma
```

### Regenerating Prisma Client

After changing the schema:

```bash
pnpm run generate
```

This is automatically run as part of the build process, but you may need it during development.

## Database Package Structure

```
packages/database/
├── prisma/
│   ├── schema.prisma          # Prisma schema definition
│   └── migrations/            # Migration files
│       ├── 20251027155525_first/
│       │   └── migration.sql
│       └── migration_lock.toml
├── src/
│   ├── client.ts              # Database client factory
│   ├── seed.ts                # Seed data
│   └── index.ts               # Package exports
├── package.json
└── tsconfig.json
```

## Seeding Data

To seed your database with initial data:

```bash
pnpm run db:seed
```

Edit the seed script at `packages/database/src/seed.ts` to customize the data.

## Common Database Tasks

### Reset Database (Caution!)

**PostgreSQL:**

```bash
pnpm run db:reset
```

**Turso:**

```bash
# Delete and recreate the database
turso db destroy <database-name>
turso db create <database-name> --group <group-name>
# Reapply all migrations
```

### View All Migrations

```bash
ls packages/database/prisma/migrations
```

### Check Migration Status

**PostgreSQL:**

```bash
pnpm --filter @react-router-gospel-stack/database prisma migrate status
```

**Turso:**
Prisma's migrate status doesn't work with Turso. You'll need to track applied migrations manually or use a migration tracking solution.

## Future: Drizzle ORM Support

We plan to add Drizzle ORM as an alternative to Prisma during setup. Drizzle offers:

- Better TypeScript inference
- Smaller bundle size
- SQL-like query syntax
- Full libSQL/Turso support

Stay tuned for updates!

## Troubleshooting

### Prisma Client Generation Errors

If you see errors about missing Prisma Client:

```bash
pnpm run generate
pnpm run build --filter=@react-router-gospel-stack/database
```

### Migration Conflicts

If you have migration conflicts after switching databases or pulling changes:

1. Backup your data
2. Delete the `migrations` folder
3. Create a fresh migration: `pnpm run db:migrate:dev`

### Turso Connection Issues

If you can't connect to Turso:

1. Check your auth token is valid: `turso db tokens create <database-name>`
2. Verify the database URL: `turso db show --url <database-name>`
3. Ensure your organization is selected: `turso org list`

### PostgreSQL Docker Container Issues

If the PostgreSQL container won't start:

```bash
# Check container status
docker ps -a

# View logs
docker logs <container-id>

# Restart the container
docker restart <container-id>
```

## Next Steps

- Learn about [Deployment](./deployment.md) with your chosen database
- Explore the [Architecture](./architecture.md) to understand how the database package fits in
- Check the [Development Guide](./development.md) for workflow tips
