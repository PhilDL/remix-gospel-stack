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

Schemas are defined in `packages/database/drizzle/schema.ts`:

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

#### Generate Migration Files

After modifying `drizzle/schema.ts`:

```bash
pnpm --filter @react-router-gospel-stack/infrastructure db:generate
```

This creates migration SQL files in `drizzle/migrations/`.

#### Apply Migrations

**Local SQLite:**

```bash
pnpm --filter @react-router-gospel-stack/infrastructure db:migrate
```

**Remote Turso:**

```bash
pnpm --filter @react-router-gospel-stack/infrastructure db:migrate:production
```

Drizzle's `push` command works with both local and remote Turso databases.

### Drizzle Studio

View and edit your database with Drizzle Studio:

```bash
pnpm --filter @react-router-gospel-stack/infrastructure db:studio
```

Opens at `https://local.drizzle.studio`

## Working with Prisma (Alternative)

### Schema Definition

Schemas are defined in `packages/database/prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
}
```

After changes, regenerate the client:

```bash
pnpm --filter @react-router-gospel-stack/infrastructure db:generate
```

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

**PostgreSQL:**

```bash
pnpm --filter @react-router-gospel-stack/infrastructure db:migrate
```

**Turso:** Prisma cannot apply migrations directly to Turso. You must apply manually:

```bash
pnpm db:migrate  # Generate SQL
sqlite3 local.db < packages/database/prisma/migrations/<folder>/migration.sql
```

For remote Turso:

```bash
turso db shell <database-name> < packages/database/prisma/migrations/<folder>/migration.sql
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
pnpm db:migrate

# With Prisma
pnpm db:migrate
sqlite3 local.db < packages/database/prisma/migrations/<folder>/migration.sql
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
   pnpm db:migrate:production

   # With Prisma - manual application
   pnpm db:migrate:production
   turso db shell <database-name> < packages/database/prisma/migrations/<folder>/migration.sql
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
   pnpm db:migrate
   ```

### Production PostgreSQL

For production on Fly.io, see [Deployment Guide](./deployment.md).

## Database Package Structure

```
packages/database/
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

Edit `packages/database/src/seed.ts` to customize seed data.

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
pnpm db:migrate  # Reapply migrations
```

**PostgreSQL:**

```bash
docker compose down -v
pnpm run docker:db
pnpm db:migrate
```

**Remote Turso:**

```bash
turso db destroy <database-name>
turso db create <database-name> --group <group-name>
pnpm db:migrate:production  # or apply migrations manually
```

### Switch ORMs

To switch between Drizzle and Prisma:

```bash
pnpm turbo gen scaffold-database
```

Select your preferred ORM. The generator updates `src/index.ts` to export the correct client as default.

## Troubleshooting

### "Cannot find module" errors

Regenerate the client:

```bash
# Drizzle or Prisma
pnpm db:generate


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
