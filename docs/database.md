# Database Guide

This stack supports two ORMs (Drizzle and Prisma) and two databases (Turso and PostgreSQL). During setup, you choose your preferred ORM and database.

## Recommended Stack: Drizzle + Turso

**Drizzle ORM** is the default for its SQL-like syntax, zero runtime overhead, and full Turso migration support.

**Turso** provides edge-optimized SQLite with embedded replicas, generous free tiers, and built-in backups.

See [Why Drizzle Over Prisma?](./why-drizzle-over-prisma.md) for our reasoning.

## Choosing Your Stack

During `pnpm run setup`, you'll choose:

1. **ORM**: Drizzle (default) or Prisma
2. **Database**: Turso (default) or PostgreSQL

You can switch anytime using:

```bash
pnpm turbo gen scaffold-database
```

## Working with Drizzle (Default)

### Schema Definition

Schemas are defined in `packages/infrastructure/drizzle/schema.ts`:

```typescript
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("User", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: text("emailVerified"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

No code generation needed - edit the schema and immediately use it.

### Querying with Drizzle

```typescript
import { eq } from "drizzle-orm";

import { users } from "@react-router-gospel-stack/infrastructure";

import { db } from "~/db.server";

export const loader = async () => {
  // Select all users
  const allUsers = await db.select().from(users);

  // Find by email
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, "test@example.com"));

  // Insert
  await db.insert(users).values({ name: "John", email: "john@example.com" });

  // Update
  await db.update(users).set({ name: "Jane" }).where(eq(users.id, userId));

  // Delete
  await db.delete(users).where(eq(users.id, userId));

  return { allUsers };
};
```

### Migrations with Drizzle

Drizzle doesn't require a client generation step - edit the schema and use it directly.

#### Generate New Migration

After modifying `drizzle/schema.ts`, create a new migration:

```bash
pnpm run db:migrate:new
```

This is an interactive command that will:

1. Compare your schema with the database
2. Generate migration SQL files in `drizzle/migrations/`
3. Prompt you to name the migration

#### Apply Migrations

**Local (SQLite or PostgreSQL):**

```bash
pnpm run db:migrate:apply
```

**Production (reads from `.env.production`):**

```bash
pnpm run db:migrate:apply:production
```

This works with both local and remote Turso databases, as well as PostgreSQL.

### Drizzle Studio

View and edit your database with Drizzle Studio:

```bash
pnpm --filter @react-router-gospel-stack/infrastructure db:studio
```

Opens at `https://local.drizzle.studio`

## Working with Prisma (Alternative)

### Schema Definition

Schemas are defined in `packages/infrastructure/prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
}
```

After schema changes, regenerate the TypeScript client:

```bash
pnpm run db:generate
```

> **Note:** With Prisma, `db:generate` only generates the TypeScript client. It does not create migrations.

### Querying with Prisma

```typescript
import { db } from "~/db.server";

export const loader = async () => {
  const allUsers = await db.user.findMany();
  const user = await db.user.findUnique({
    where: { email: "test@example.com" },
  });
  await db.user.create({ data: { name: "John", email: "john@example.com" } });
  return { allUsers };
};
```

### Migrations with Prisma

#### Generate New Migration

After modifying the Prisma schema, create a new migration:

```bash
pnpm run db:migrate:new
```

This will:

1. Compare your schema with the database
2. Generate migration SQL files in `prisma/migrations/`
3. Prompt you to name the migration

#### Apply Migrations

**PostgreSQL:**

```bash
pnpm run db:migrate:apply
```

**Turso:** Prisma cannot apply migrations directly to Turso. Generate the migration first, then apply manually:

```bash
# 1. Generate the migration (creates SQL file)
pnpm run db:migrate:new

# 2. Apply manually to local Turso
sqlite3 local.db < packages/infrastructure/prisma/migrations/<folder>/migration.sql

# 3. Or apply to remote Turso
turso db shell <database-name> < packages/infrastructure/prisma/migrations/<folder>/migration.sql
```

### Prisma Studio

```bash
pnpm --filter @react-router-gospel-stack/infrastructure prisma:studio
```

## Turso Setup

### Local Development

Configure `.env`:

```bash
DATABASE_URL="file:../../local.db"
# No sync URL or auth token needed for local dev
```

Apply your initial migration:

```bash
# With Drizzle
pnpm db:migrate:apply

# With Prisma
pnpm db:migrate:apply
sqlite3 local.db < packages/infrastructure/prisma/migrations/<folder>/migration.sql
```

### Production with Turso

1. **Install Turso CLI:**

   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   turso auth login
   ```

2. **Create Database:**

   ```bash
   turso group create <group-name>
   turso db create <database-name> --group <group-name>
   ```

3. **Get Credentials:**

   ```bash
   turso db show --url <database-name>
   turso db tokens create <database-name>
   ```

4. **Configure Environment:**

   ```bash
   DATABASE_URL="file:/data/libsql/local.db"
   DATABASE_SYNC_URL="libsql://[db].turso.io"
   DATABASE_AUTH_TOKEN="<token>"
   ```

5. **Apply Migrations:**

   ```bash
   # With Drizzle - direct push to remote
   pnpm db:migrate:apply:production

   # With Prisma - manual application
   pnpm db:migrate:apply:production
   turso db shell <database-name> < packages/infrastructure/prisma/migrations/<folder>/migration.sql
   ```

### Embedded Replicas

Turso's embedded replicas provide local-first resilience:

1. **Local SQLite file** serves reads (fast)
2. **Automatic sync** with remote database (every 60s)
3. **Writes** go to remote first, then sync locally
4. **Offline resilience** - reads work even if remote is unavailable

The client automatically handles this when you provide `syncUrl`.

## PostgreSQL Setup

### Local Development

1. **Start PostgreSQL:**

   The stack includes a Docker Compose configuration that automatically creates the database:

   ```bash
   pnpm run docker:db
   ```

   This starts a PostgreSQL container with:
   - Username: `postgres`
   - Password: `postgres`
   - Database: `remix_gospel` (automatically created)
   - Port: `5432`

   > **Note:** If you're using an existing PostgreSQL installation, you'll need to create the database manually:
   >
   > ```bash
   > psql -U postgres -c "CREATE DATABASE remix_gospel;"
   > ```

2. **Configure `.env`:**

   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/remix_gospel"
   ```

3. **Run Migrations:**

   ```bash
   # With Drizzle or Prisma
   pnpm db:migrate:apply
   ```

### Production PostgreSQL

For production on Fly.io, see [Deployment Guide](./deployment.md).

## Database Package Structure

```
packages/infrastructure/
├── drizzle/
│   ├── schema.ts              # Drizzle schema (default)
│   └── migrations/            # Drizzle migrations
├── prisma/
│   ├── schema.prisma          # Prisma schema (alternative)
│   └── migrations/            # Prisma migrations
├── src/
│   ├── client.ts              # Client factory (Drizzle or Prisma)
│   ├── seed.ts                # Seed script
│   └── index.ts               # Package exports
├── drizzle.config.ts          # Drizzle configuration (optional)
├── prisma.config.ts          # Prisma configuration (optional)
└── package.json
```

## Seeding Data

The seed script adapts to your chosen ORM:

```bash
pnpm --filter @react-router-gospel-stack/infrastructure db:seed
```

Edit `packages/infrastructure/src/database/seed.ts` to customize seed data.

## Common Tasks

### View Database

**Drizzle:**

```bash
pnpm --filter @react-router-gospel-stack/infrastructure db:studio
```

**Prisma:**

```bash
pnpm --filter @react-router-gospel-stack/infrastructure prisma:studio
```

### Reset Database

**Local SQLite:**

```bash
rm local.db
pnpm db:migrate:apply  # Reapply migrations
```

**PostgreSQL:**

```bash
docker compose down -v
pnpm run docker:db
pnpm db:migrate:apply
```

**Remote Turso:**

```bash
turso db destroy <database-name>
turso db create <database-name> --group <group-name>
pnpm db:migrate:apply:production  # or apply migrations manually
```

### Switch ORMs

To switch between Drizzle and Prisma:

```bash
pnpm turbo gen scaffold-database
```

Select your preferred ORM. The generator updates `src/index.ts` to export the correct client as default.

## Troubleshooting

### "Cannot find module" errors

**With Prisma:** Regenerate the TypeScript client:

```bash
pnpm run db:generate
```

**With Drizzle:** No client generation needed. Check that your schema is properly imported.

### Migration conflicts after switching databases

1. Backup your data
2. Delete the migrations folder for your ORM
3. Create a fresh initial migration

### Turso connection issues

1. Verify credentials: `turso db show --url <database-name>`
2. Check token: `turso db tokens create <database-name>`
3. Ensure correct org: `turso org list`

## Next Steps

- [Why Drizzle Over Prisma?](./why-drizzle-over-prisma.md) - Understanding our ORM choice
- [Deployment](./deployment.md) - Deploy with your chosen stack
- [Architecture](./architecture.md) - How the database package fits in
- [Development](./development.md) - Workflow tips

```

```
