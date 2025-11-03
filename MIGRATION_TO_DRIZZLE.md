# Migration to Drizzle ORM

This document summarizes the changes made to add Drizzle ORM as the default ORM for the React Router Gospel Stack.

## Summary

Drizzle ORM is now the **default and recommended ORM**, with Prisma available as an alternative. Users can choose their preferred ORM during the setup process or switch between them at any time.

The setup flow now asks for **database first, then ORM**, making the choice more logical and context-aware. All code generation is done through **Handlebars (HBS) templates** instead of string literals in the generator code.

## Changes Made

### 1. Database Package (`packages/database`)

#### New Files Created

- **`drizzle/schema.ts`** - Drizzle schema definition with User table
- **`drizzle/migrations/0000_initial.sql`** - Initial migration SQL
- **`drizzle/migrations/meta/`** - Migration metadata files
- **`drizzle.config.ts`** - Drizzle Kit configuration
- **`src/drizzle-client.ts`** - Drizzle client factory with Turso support

#### Modified Files

- **`package.json`**
  - Added Drizzle dependencies: `drizzle-orm`, `@libsql/client`, `drizzle-kit`
  - Moved Prisma to devDependencies
  - Updated scripts to default to Drizzle (`db:*` commands)
  - Kept Prisma scripts with `prisma:*` prefix

- **`src/index.ts`**
  - Now exports Drizzle schema and client as default
  - Exports Prisma with `createPrismaClient` and `PrismaUser` to avoid naming conflicts

- **`src/seed.ts`**
  - Updated to use Drizzle by default

### 2. Setup Script (`scripts/setup.mjs`)

- **Reordered prompts**: Now asks for database first, then ORM (more logical flow)
- Shows database name in ORM prompt for context
- Updated to pass both database and ORM choices to turbo generator
- Modified client generation step to handle both ORMs
- Improved next steps output with clearer formatting and emoji indicators

### 3. Turbo Generator (`turbo/generators/config.ts`)

- **Separated database and ORM prompts** with descriptive labels
- **Replaced all string-based code generation with HBS templates**:
  - `templates/drizzle-schema.ts.hbs` - Drizzle schema
  - `templates/drizzle-client.ts.hbs` - Drizzle client factory
  - `templates/database-index-drizzle.ts.hbs` - Index for Drizzle default
  - `templates/database-index-prisma.ts.hbs` - Index for Prisma default
  - `templates/seed-drizzle.ts.hbs` - Seed script for Drizzle
  - `templates/seed-prisma.ts.hbs` - Seed script for Prisma
  - `templates/env.example.hbs` - Environment variables template
- Conditionally generates Drizzle files only when needed
- Updated `updatePackageJson` to set correct migration commands per ORM
- Made Turso the default database choice

### 4. Documentation

#### New Files

- **`docs/why-drizzle-over-prisma.md`**
  - Explains the benefits of Drizzle: SQL-like syntax, no runtime, pure TypeScript, full Turso support
  - Covers when to use Prisma instead
  - Concise decision document

#### Updated Files

- **`docs/database.md`** - Complete rewrite
  - Now covers both Drizzle and Prisma workflows
  - Drizzle presented first as the default
  - Clear sections for each ORM with migration instructions
  - Updated for both Turso and PostgreSQL

- **`docs/development.md`**
  - Added ORM selection to initial setup section
  - Updated database setup instructions for both ORMs
  - Added separate sections for working with Drizzle vs Prisma
  - Updated pnpm catalog documentation

- **`README.md`**
  - Updated to list both ORMs as choices
  - Changed default recommendations to Drizzle + Turso
  - Added link to decision document

### 5. Git Configuration

- **`.gitignore`**
  - Added `local.db` and SQLite WAL files to ignore list

## Key Features

### Drizzle Benefits

1. **SQL-like syntax** - Easy to learn and understand for SQL developers
2. **Zero runtime overhead** - No query engine binary needed
3. **Pure TypeScript** - No code generation step required for the client
4. **Full Turso support** - Can push migrations directly to remote databases
5. **Better edge compatibility** - Smaller bundle, no native dependencies

### Dual ORM Support

The package exports both ORMs simultaneously:

```typescript
// Drizzle (default exports)
// Prisma (alternative exports)
import {
  createClient,
  createPrismaClient,
  PrismaClient,
  users,
} from "@react-router-gospel-stack/database";
import type {
  NewUser,
  PrismaUser,
  User,
} from "@react-router-gospel-stack/database";
```

### Switching ORMs

Users can switch ORMs at any time:

```bash
pnpm turbo gen scaffold-database
```

This updates:

- Default exports in `src/index.ts`
- Package scripts
- App package.json scripts

## Migration Path for Existing Users

Existing users of the stack can:

1. Pull the latest changes
2. Run `pnpm turbo gen scaffold-database` to configure their preferred ORM
3. If sticking with Prisma, choose "prisma" - everything will work as before
4. If migrating to Drizzle, choose "drizzle" and follow the migration steps in the database guide

## Default Stack Recommendation

- **ORM**: Drizzle
- **Database**: Turso
- **Reason**: Best developer experience, zero runtime overhead, native Turso support

## Backward Compatibility

All existing Prisma functionality remains intact and fully supported. Users can continue using Prisma without any breaking changes.

## Design Improvements

### Separation of Concerns

The generator now properly separates:

1. **Database selection** (Turso vs PostgreSQL)
2. **ORM selection** (Drizzle vs Prisma)

This makes it clear that these are two independent choices, and users select database first (the infrastructure), then ORM (the tool to interact with it).

### Template-Based Code Generation

All code generation now uses HBS templates instead of string concatenation:

**Before:**

```javascript
const drizzleIndex = `// Drizzle (default)
export * from "../drizzle/schema";
export { createClient } from "./drizzle-client";`;
fs.writeFileSync(indexPath, drizzleIndex);
```

**After:**

```javascript
{
  type: "add",
  path: "{{ turbo.paths.root }}/packages/database/src/index.ts",
  templateFile: "templates/database-index-{{ ormType }}.ts.hbs",
  force: true,
}
```

Benefits:

- ✅ Easier to maintain and update
- ✅ Proper syntax highlighting in HBS files
- ✅ No escaping issues with strings
- ✅ Clear separation between logic and templates

## Testing Checklist

- [x] Drizzle schema matches Prisma schema structure
- [x] Initial migration created for Drizzle
- [x] Client factory works with Turso embedded replicas
- [x] Seed scripts for both ORMs
- [x] Setup script asks database first, then ORM
- [x] Turbo generator uses HBS templates
- [x] Conditional template generation (skip Drizzle files when using Prisma)
- [x] Documentation updated and complete
- [x] No linter errors
- [x] Exports properly avoid naming conflicts

## Next Steps

Users should:

1. Read [Why Drizzle Over Prisma?](./docs/why-drizzle-over-prisma.md)
2. Follow the [Database Guide](./docs/database.md) for setup
3. Try the recommended Drizzle + Turso stack for new projects
