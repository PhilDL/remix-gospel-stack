# React Router Gospel Stack with Turborepo

![The React Router Gospel Stack](https://repository-images.githubusercontent.com/533426847/134e6276-a6a8-41f1-94d3-f6dcb8f58b5f)

React Router TypeScript monorepo with Turborepo pipelines, Prisma ORM, PostgreSQL OR SQLite (Turso), Docker deploy to Fly.io, pnpm, shadcn/ui, and TailwindCSS.

> [!IMPORTANT]  
> This used to be the remix-gospel-stack (Remix v2) but to follow remix merging back into react router, the stack was converted to **React Router v7+**. And the name was changed to `react-router-gospel-stack`.
>
> In this migration, we made other adjustments to the stack that reflects what I'm using in production SaaS apps:
>
> - Using Turso instead of LiteFS ([decision](./docs/why-turso-instead-of-litefs.md))
> - Dropping the NextJS app and the Vercel deployments (I was not using them so difficult to maintain)
> - We now use pnpm catalogs to define our versions in one file.

## Quick Start

### Recommended: Using degit

```bash
pnpm dlx degit PhilDL/react-router-gospel-stack my-app
cd my-app
pnpm install
pnpm run init
```

### Alternative: Clone the Repository

```bash
git clone git@github.com:PhilDL/react-router-gospel-stack.git my-app
cd my-app
pnpm install
pnpm run init
```

> :minidisc: This repository is opiniated:
>
> - **TypeScript** only
> - Only compatible with **pnpm** package manager to handle monorepo workspaces
> - Uses turborepo pipelines + cache to build, lint, typecheck, and test the monorepo

## What's in the Stack

This is a **production-ready monorepo** for building modern web applications with React Router, optimized for developer experience and deployment simplicity.

### Core Technologies

- 🚀 **[React Router v7+](https://reactrouter.com)** - Modern full-stack React framework
- 📦 **[Turborepo](https://turborepo.org/)** - High-performance build system for monorepos
- 🗄️ **Database** - Choose between:
  - [PostgreSQL](https://www.postgresql.org/) - Multi-region Fly PostgreSQL Cluster
  - [Turso](https://turso.tech/) - Distributed SQLite with libSQL (recommended)
- 🛠️ **[Prisma](https://prisma.io)** - Type-safe ORM (future: Drizzle option)
- 🎨 **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component system
- 🎯 **[TailwindCSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- 🐳 **[Docker](https://www.docker.com/)** - Containerized deployment
- 🪂 **[Fly.io](https://fly.io)** - Multi-region deployment platform

### Developer Tools

- ✅ **[TypeScript](https://typescriptlang.org)** - Type safety across the stack
- 🧪 **[Vitest](https://vitest.dev)** - Fast unit testing
- 🎭 **[Playwright](https://playwright.dev)** - End-to-end testing
- 🔍 **[ESLint](https://eslint.org)** - Code linting
- 💅 **[Prettier](https://prettier.io)** - Code formatting
- 🔄 **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipelines

## Documentation

- 🚀 **[Initialization Guide](./docs/initialization.md)** - Set up a new project from this template
- 📚 **[Architecture](./docs/architecture.md)** - Understand the monorepo structure and packages
- 🛠️ **[Development Guide](./docs/development.md)** - Set up your local development environment
- 🗄️ **[Database Guide](./docs/database.md)** - Configure PostgreSQL or Turso, migrations, and switching
- ☁️ **[Deployment Guide](./docs/deployment.md)** - Deploy to Fly.io with Docker
- 🎨 **[UI Package](./docs/ui-package.md)** - Work with shadcn/ui components
- 🧪 **[Testing Guide](./docs/testing.md)** - Run tests, linting, and typechecking

### Key Decisions

- [Why Turso instead of LiteFS?](./docs/why-turso-instead-of-litefs.md)

## Getting Started

1. **Clone or create** your project using one of the quick start methods above
2. **Read the [Architecture Guide](./docs/architecture.md)** to understand the monorepo structure
3. **Follow the [Development Guide](./docs/development.md)** to set up your local environment
4. **Configure your [Database](./docs/database.md)** (PostgreSQL or Turso)
5. **Start building!** 🎉

## Key Features

### Monorepo Structure
- **Apps** - Your applications (React Router webapp included)
- **Packages** - Shared code, UI components, database, business logic
- **Config Packages** - ESLint, TypeScript, and Tailwind configurations

### Production Ready
- Multi-region deployment support
- Health check endpoints for failover
- Automated CI/CD with GitHub Actions
- Docker containerization
- Environment-based deployments (staging/production)

### Flexible Database
Choose your database at setup time:
- **PostgreSQL** for traditional relational database needs
- **Turso** for edge-optimized SQLite with embedded replicas

> **Note:** Future versions will support choosing between Prisma and Drizzle ORM

## Support & Contributing

- ⭐ Found this useful? [Give it a star!](https://github.com/PhilDL/react-router-gospel-stack)
- 🐛 Found a bug? [Open an issue](https://github.com/PhilDL/react-router-gospel-stack/issues)
- 💡 Have an improvement? [Submit a PR](https://github.com/PhilDL/react-router-gospel-stack/pulls)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Thanks & Credits

- The ESM setup is heavily inspired by the [epic-stack](https://github.com/epicweb-dev/epic-stack) by [@kentcdodds](https://github.com/kentcdodds)
- Thanks to [@shadcn](https://github.com/shadcn) for the amazing [component library](https://github.com/shadcn/ui)
- UI integration and practices borrowed from [@juliusmarminge](https://github.com/juliusmarminge)'s [acme-corp monorepo](https://github.com/juliusmarminge/acme-corp)

## Disclaimer

I am learning and improving this stack continuously. The setup proposed here is one of many possible approaches. If you see any possible improvements, please submit a PR—I will appreciate it greatly!

## License

MIT
