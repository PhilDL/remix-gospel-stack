# Why Drizzle Over Prisma?

This stack defaults to Drizzle ORM, with Prisma available as an alternative. Here's why we prefer Drizzle:

## Closer to SQL

Drizzle's API mirrors SQL syntax, making it easier to understand and predict:

```typescript
// Drizzle - SQL-like
const users = await db.select().from(users).where(eq(users.email, email));

// Prisma - abstracted syntax
const users = await db.user.findMany({ where: { email } });
```

For developers who understand SQL, Drizzle feels natural and requires less mental translation.

## No Runtime Library

Drizzle has zero runtime overhead - it's a thin TypeScript wrapper around your database driver. Prisma includes a runtime query engine that adds ~5MB to your bundle and additional runtime complexity.

This means:

- Smaller bundle sizes
- Faster cold starts
- Simpler deployment (no binary dependencies)
- Better edge runtime compatibility

## Pure TypeScript with No Generation Step

Drizzle schemas are written in pure TypeScript with no code generation needed for the client:

```typescript
// Drizzle schema - just TypeScript
export const users = sqliteTable("User", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
});

export type User = typeof users.$inferSelect;
```

With Prisma, you must run `prisma generate` after every schema change to regenerate the client. Drizzle's schema is the source of truth - edit it and immediately use it.

## Full Turso/LibSQL Migration Support

**Critical for Turso users:** Drizzle fully supports migrations for Turso/LibSQL databases. Prisma does not.

With Drizzle and Turso:

```bash
pnpm run db:migrate:new              # Generate migration files (interactive)
pnpm run db:migrate:apply:production # Apply directly to remote Turso database
```

With Prisma and Turso:

```bash
pnpm run db:migrate:new  # Generate SQL files
# Must manually apply: turso db shell <db> < migration.sql
```

Drizzle's `drizzle-kit push` can apply migrations directly to remote Turso databases, making the development workflow much smoother.

## When to Use Prisma Instead

Consider Prisma if you:

- Prefer Prisma's abstracted syntax and DSL
- Already have a large Prisma codebase to migrate
- Need Prisma-specific features like middleware or extensions
- Use PostgreSQL only (negates the Turso migration advantage)

## Summary

Drizzle provides:

- ✅ SQL-like syntax that's easier to learn and predict
- ✅ Zero runtime overhead (no query engine binary)
- ✅ Pure TypeScript with no generation step
- ✅ Full Turso migration support via `drizzle-kit push`
- ✅ Better edge runtime compatibility
- ✅ Smaller bundle sizes

Both ORMs are excellent choices. We default to Drizzle for its simplicity, TypeScript-first approach, and superior Turso support.
