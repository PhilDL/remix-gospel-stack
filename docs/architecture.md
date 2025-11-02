# Architecture Guide

This guide explains the monorepo architecture of the React Router Gospel Stack, how packages are organized, and how they work together.

## Overview

The React Router Gospel Stack is a **monorepo** powered by:
- **[pnpm workspaces](https://pnpm.io/workspaces)** for package management
- **[Turborepo](https://turborepo.org/)** for build orchestration and caching
- **TypeScript** for type safety across all packages

This architecture allows you to:
- Share code between applications
- Build packages independently
- Cache build outputs for faster development
- Maintain consistent tooling and configuration

## Monorepo Structure

```
react-router-gospel-stack/
├── apps/                    # Applications
│   └── webapp/              # React Router application
├── packages/                # Shared packages
│   ├── business/            # Business logic layer
│   ├── database/            # Prisma ORM wrapper
│   ├── internal-nobuild/    # TypeScript-only package
│   └── ui/                  # shadcn/ui components
├── config/                  # Shared configurations
│   ├── eslint/              # ESLint configurations
│   ├── tsconfig/            # TypeScript configurations
│   └── tailwind/            # Tailwind configurations
├── turbo.json               # Turborepo pipeline configuration
├── pnpm-workspace.yaml      # pnpm workspace definition
└── package.json             # Root package.json
```

## Applications (`apps/`)

### `webapp` - React Router Application

The main React Router v7+ application, configured for server-side rendering and deployment to Fly.io.

**Key Features:**
- React Router v7+ with file-based routing
- Server-side rendering (SSR)
- Built with Vite
- Deployed via Docker to Fly.io
- Consumes packages from the monorepo

**Structure:**
```
apps/webapp/
├── app/                     # React Router app code
│   ├── routes/              # File-based routes
│   ├── db.server.ts         # Database client
│   ├── root.tsx             # Root component
│   └── routes.ts            # Route configuration
├── server/                  # Server setup
│   ├── index.ts             # Server entry
│   └── middleware/          # Express middleware
├── public/                  # Static assets
├── tests/                   # E2E and unit tests
├── vite.config.ts           # Vite configuration
├── Dockerfile               # Docker build
└── fly.toml                 # Fly.io configuration
```

**Dependencies:**
- `@react-router-gospel-stack/database` - Database access
- `@react-router-gospel-stack/business` - Business logic
- `@react-router-gospel-stack/ui` - UI components
- `@react-router-gospel-stack/internal-nobuild` - Internal utilities

## Packages (`packages/`)

### `database` - Prisma ORM Wrapper

A bundled package that wraps Prisma Client and provides a type-safe database interface.

**Why it exists:**
- Centralizes database schema and migrations
- Provides a single source of truth for data models
- Can be imported by multiple apps or packages
- Bundles the Prisma Client for distribution

**Key Files:**
```
packages/database/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
├── src/
│   ├── client.ts            # Client factory
│   ├── seed.ts              # Seed data
│   └── index.ts             # Exports
└── package.json             # Build with tsup
```

**Build:**
- Bundled with [tsup](https://tsup.egoist.dev/)
- Generates CommonJS and ESM builds
- Includes Prisma Client in the bundle

**Usage:**
```typescript
import { db } from "@react-router-gospel-stack/database";

const users = await db.user.findMany();
```

### `business` - Business Logic Layer

Example package demonstrating the **repository pattern** for business logic.

**Purpose:**
- Separates business logic from framework code
- Makes code testable and portable
- Demonstrates clean architecture principles

**Structure:**
```
packages/business/
├── src/
│   ├── repositories/        # Repository interfaces
│   ├── infrastructure/      # Repository implementations
│   └── shared/              # DTOs and utilities
└── package.json
```

**Pattern:**
```typescript
// Repository interface (domain layer)
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}

// Prisma implementation (infrastructure layer)
export class PrismaUserRepository implements UserRepository {
  constructor(private db: PrismaClient) {}
  
  async findById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }
}
```

**Build:**
- Bundled with tsup
- Depends on the `database` package

### `internal-nobuild` - TypeScript-Only Package

Example of a **pure TypeScript package** with no build step.

**Why no build?**
- Faster development (no build to wait for)
- Simpler package configuration
- React Router compiles it during its own build
- Perfect for internal packages you won't publish

**How it works:**
```json
// package.json
{
  "main": "./src/index.ts",  // Points directly to source
  "types": "./src/index.ts"
}
```

React Router's build process (using esbuild) compiles this package when building the webapp.

**When to use:**
- Internal utilities
- Shared types and interfaces
- Small helper functions
- Packages you won't publish to npm

**When NOT to use:**
- Packages that need standalone distribution
- Packages used by multiple apps with different build tools
- Packages that need complex build steps

**Structure:**
```
packages/internal-nobuild/
├── src/
│   ├── index.ts             # Main entry
│   ├── client/              # Client-side code
│   ├── queries.server/      # Server-only code
│   └── types.ts             # Shared types
├── vitest.config.ts         # Unit test config
└── package.json
```

### `ui` - shadcn/ui Component Library

A React component library built with [shadcn/ui](https://ui.shadcn.com/) and Tailwind CSS.

**Features:**
- Pre-built accessible components
- Tailwind CSS integration
- Exportable Tailwind theme
- Type-safe component props

**Structure:**
```
packages/ui/
├── src/
│   ├── components/          # React components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── tailwind/            # Tailwind config
│   │   └── theme.css
│   └── index.ts             # Exports
├── components.json          # shadcn/ui config
└── package.json
```

**Build:**
- Bundled with tsup
- Exports both components and Tailwind config

**Usage:**
```typescript
import { Button, Card } from "@react-router-gospel-stack/ui";

export function MyComponent() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

See the [UI Package Guide](./ui-package.md) for more details.

## Configuration Packages (`config/`)

### `eslint` - ESLint Configurations

Shared ESLint configurations and custom rules.

**Available configs:**
- `base.js` - Base ESLint rules
- `react-router.js` - React Router-specific rules
- `plugin.js` - Custom ESLint plugin

**Usage:**
```javascript
// eslint.config.js
import baseConfig from "@react-router-gospel-stack/eslint-config/base";

export default [
  ...baseConfig,
  // Your overrides
];
```

### `tsconfig` - TypeScript Configurations

Shared TypeScript configurations.

**Available configs:**
- `base.json` - Base TypeScript config
- `react.json` - React app config
- `node22.json` - Node.js 22 config

**Usage:**
```json
{
  "extends": "@react-router-gospel-stack/tsconfig/react.json",
  "compilerOptions": {
    // Your overrides
  }
}
```

### `tailwind` - Tailwind CSS Configuration

Shared Tailwind theme and configuration.

**Exports:**
- Tailwind plugin
- Tailwind preset
- Theme tokens

The `ui` package extends this configuration.

## Turborepo Pipelines

Turborepo orchestrates tasks across the monorepo with intelligent caching.

### Pipeline Configuration

Defined in `turbo.json`:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {},
    "test": {}
  }
}
```

### Key Pipelines

**`build`**
- Builds packages and apps
- Depends on dependencies being built first (`^build`)
- Caches outputs for reuse

**`dev`**
- Starts development servers
- Not cached (persistent processes)

**`lint`**
- Runs ESLint across the monorepo
- Cached based on source files

**`typecheck`**
- Runs TypeScript compiler checks
- Cached based on source and config files

**`test`**
- Runs unit tests (Vitest)
- Cached based on source and test files

### Running Pipelines

```bash
# Run for entire monorepo
pnpm run build
pnpm run lint
pnpm run test

# Run for specific package
pnpm run build --filter=@react-router-gospel-stack/ui

# Run for package and dependencies
pnpm run build --filter=@react-router-gospel-stack/webapp...
```

### Cache Benefits

Turborepo caches task outputs. If you:
1. Build a package
2. Make no changes
3. Build again

The second build is **instant** because Turborepo uses the cached output.

This applies to:
- Builds
- Linting
- Type checking
- Tests

## Package Dependencies

Visual dependency graph:

```
webapp (app)
  ├── database (package)
  ├── business (package)
  │   └── database (package)
  ├── ui (package)
  │   └── tailwind (config)
  └── internal-nobuild (package)

database (package)
  └── (no internal deps)

business (package)
  └── database (package)

ui (package)
  └── tailwind (config)

internal-nobuild (package)
  └── (no internal deps)
```

**Dependency rules:**
- Apps can depend on any package
- Packages can depend on other packages
- Avoid circular dependencies
- Config packages have no dependencies

## TypeScript Path Mapping

The monorepo uses TypeScript path aliases for imports.

**In `webapp/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@react-router-gospel-stack/database": ["../../packages/database/src"],
      "@react-router-gospel-stack/ui": ["../../packages/ui/src"]
    }
  }
}
```

This allows importing from source during development:
```typescript
import { db } from "@react-router-gospel-stack/database";
```

React Router's build step compiles these imports.

## Adding New Packages

### Built Package (with tsup)

1. Copy an existing package structure (e.g., `ui` or `business`)
2. Update `package.json`:
   ```json
   {
     "name": "@react-router-gospel-stack/my-package",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsup",
       "dev": "tsup --watch"
     }
   }
   ```
3. Configure `tsup.config.ts`:
   ```typescript
   import { defineConfig } from "tsup";
   
   export default defineConfig({
     entry: ["src/index.ts"],
     format: ["cjs", "esm"],
     dts: true,
     clean: true,
   });
   ```
4. Add to `pnpm-workspace.yaml` if needed (usually automatic)

### No-Build Package (like internal-nobuild)

1. Copy the `internal-nobuild` structure
2. Update `package.json`:
   ```json
   {
     "name": "@react-router-gospel-stack/my-internal",
     "main": "./src/index.ts",
     "types": "./src/index.ts"
   }
   ```
3. No build configuration needed!

### Using the Turbo Generator

```bash
turbo gen workspace --name @react-router-gospel-stack/my-package --type package --copy
```

Follow the prompts to scaffold a new package.

## Deployment Architecture

### Docker Build

The webapp is containerized using Docker for deployment:

**Build process:**
1. Multi-stage build for optimization
2. Install dependencies with pnpm
3. Build all packages and the webapp
4. Copy built assets to production image
5. Result: Minimal production image

**Dockerfile location:**
```
apps/webapp/Dockerfile
```

### Fly.io Deployment

The Docker image is deployed to Fly.io:

1. GitHub Action builds the Docker image
2. Image is pushed to Fly.io registry
3. Fly.io deploys the container to specified regions
4. Health checks ensure app is running

See the [Deployment Guide](./deployment.md) for details.

## Development Workflow

### Typical Development Flow

1. **Start dev server:**
   ```bash
   pnpm run dev --filter=webapp...
   ```

2. **Make changes** in any package

3. **Hot reload** - Changes are immediately reflected

4. **Run tests:**
   ```bash
   pnpm run test
   ```

5. **Build for production:**
   ```bash
   pnpm run build
   ```

### Working on Multiple Packages

**Terminal 1 - Webapp:**
```bash
pnpm run dev --filter=webapp
```

**Terminal 2 - UI Package:**
```bash
pnpm run dev --filter=ui
```

Both will watch for changes and rebuild automatically.

## Best Practices

### Package Design

1. **Single Responsibility** - Each package should have one clear purpose
2. **Minimal Dependencies** - Only depend on what you need
3. **Export Cleanly** - Use a clear `index.ts` for exports
4. **Type Safety** - Export types alongside implementations

### Build Strategy

1. **Built packages** for:
   - Packages you might publish
   - Packages used by different build tools
   - Packages with complex build requirements

2. **No-build packages** for:
   - Internal utilities
   - Simple shared code
   - Faster development iteration

### Monorepo Hygiene

1. **Install from root** - Always run `pnpm install` from the monorepo root
2. **Use filters** - Target specific packages with `--filter`
3. **Leverage cache** - Let Turborepo cache what it can
4. **Consistent versions** - Use pnpm catalogs to manage versions

## Scaling the Monorepo

### Adding Applications

To add another application (e.g., a Next.js app, API server):

1. Create directory in `apps/`
2. Set up the application
3. Add to `pnpm-workspace.yaml` if needed
4. Configure in `turbo.json`
5. Consume existing packages

### Splitting Packages

When a package gets large:

1. Identify logical boundaries
2. Create new packages
3. Move code gradually
4. Update imports
5. Test thoroughly

### Performance Optimization

As the monorepo grows:

1. **Use remote caching** - Turborepo Remote Cache for teams
2. **Optimize filters** - Don't build unnecessary packages
3. **Incremental builds** - Only build what changed
4. **Parallel execution** - Turborepo runs tasks in parallel

## Troubleshooting

### Build Failures

If builds fail:

```bash
# Clean everything
pnpm run clean  # If you have this script

# Reinstall dependencies
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install

# Rebuild from scratch
pnpm run build
```

### Type Errors

If TypeScript can't find types:

```bash
# Regenerate Prisma Client
pnpm run generate

# Build packages
pnpm run build --filter=@react-router-gospel-stack/database
```

### Cache Issues

If Turborepo cache seems stale:

```bash
# Clear Turborepo cache
rm -rf .turbo
pnpm run build
```

## Next Steps

- Explore the [UI Package](./ui-package.md) for component development
- Read the [Development Guide](./development.md) for workflow tips
- Check [Testing Guide](./testing.md) for testing strategies
- Review [Deployment Guide](./deployment.md) for production concerns

## Resources

- [Turborepo Documentation](https://turborepo.org/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [React Router Documentation](https://reactrouter.com/start/framework)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

