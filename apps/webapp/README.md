# React Router Gospel Stack - WebApp

This is the main React Router v7+ application that lives inside the monorepo.

- [React Router Docs](https://reactrouter.com/)

## Development

> **⚠️ Important:**  
> All the following commands should be launched from the **monorepo root directory**

Start the React Router development server:

```sh
pnpm run dev --filter=@react-router-gospel-stack/webapp
```

This starts your app in development mode with hot module replacement (HMR). Changes to your code will be reflected immediately in the browser.

## Deployment

See the [Deployment Guide](../../docs/deployment.md) for detailed instructions on deploying to Fly.io.

### Quick Deploy to Fly.io

1. Set up Fly.io apps and secrets (see deployment guide)
2. Push to GitHub:
   - Push to `main` branch → deploys to production
   - Push to `dev` branch → deploys to staging

### Docker Build

Build the Docker image locally:

```sh
# From monorepo root
pnpm docker:build:webapp
```

Run the Docker image:

```sh
pnpm docker:run:webapp
```

## Project Structure

```
apps/webapp/
├── app/                     # React Router application code
│   ├── routes/              # File-based routes
│   │   ├── _index.tsx       # Homepage
│   │   └── healthcheck.tsx  # Health check endpoint
│   ├── styles/              # Global styles
│   ├── db.server.ts         # Database client
│   ├── env.server.ts        # Environment variables
│   ├── root.tsx             # Root component
│   └── routes.ts            # Route configuration
├── server/                  # Server setup
│   ├── index.ts             # Server entry point
│   ├── middleware/          # Express middleware
│   │   ├── cspnonce.ts      # Content Security Policy
│   │   ├── logger.ts        # Request logging
│   │   ├── rate-limit.ts    # Rate limiting
│   │   └── security.ts      # Security headers
│   └── utils/               # Server utilities
├── tests/                   # Tests
│   ├── e2e/                 # Playwright E2E tests
│   │   └── app.spec.ts
│   └── db-utils.ts          # Database test helpers
├── public/                  # Static assets
├── Dockerfile               # Docker build
├── fly.toml                 # Fly.io configuration
├── vite.config.ts           # Vite configuration
└── package.json
```

## Available Scripts

All scripts should be run from the monorepo root with the `--filter` flag:

```sh
# Development
pnpm run dev --filter=@react-router-gospel-stack/webapp

# Build
pnpm run build --filter=@react-router-gospel-stack/webapp

# Type checking
pnpm run typecheck --filter=@react-router-gospel-stack/webapp

# Linting
pnpm run lint --filter=@react-router-gospel-stack/webapp

# Unit tests
pnpm run test --filter=@react-router-gospel-stack/webapp

# E2E tests
pnpm run test:e2e:dev --filter=@react-router-gospel-stack/webapp
```

## Adding Routes

React Router v7 uses file-based routing. Add new routes in the `app/routes/` directory:

```typescript
// app/routes/about.tsx
export default function About() {
  return <h1>About</h1>;
}
```

Learn more: [React Router Routing Guide](https://reactrouter.com/start/framework/routing)

## Working with the Database

Import the database client from the database package:

```typescript
import { db } from "@react-router-gospel-stack/database";

export async function loader() {
  const users = await db.user.findMany();
  return { users };
}
```

## Environment Variables

Environment variables are validated using `@t3-oss/env-core` in `app/env.server.ts`:

```typescript
import { env } from "./env.server";

// Use validated environment variables
const databaseUrl = env.DATABASE_URL;
```

Add new environment variables:
1. Add to `.env.example`
2. Add validation in `app/env.server.ts`
3. Update `types/env.d.ts` for TypeScript support

## Documentation

- [Development Guide](../../docs/development.md) - Local development setup
- [Database Guide](../../docs/database.md) - Database configuration
- [Deployment Guide](../../docs/deployment.md) - Deploying to Fly.io
- [Architecture Guide](../../docs/architecture.md) - Monorepo structure
- [Testing Guide](../../docs/testing.md) - Testing strategies

## Technology Stack

- **Framework:** [React Router v7+](https://reactrouter.com/)
- **Runtime:** [Node.js](https://nodejs.org/)
- **Database:** [Prisma](https://www.prisma.io/) with PostgreSQL or Turso
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Deployment:** [Fly.io](https://fly.io/) with Docker
- **Server:** Express with Hono middleware

## Support

For issues or questions:
- Check the [documentation](../../docs/)
- Open an issue on GitHub
- See the main [README](../../README.md) for more information
