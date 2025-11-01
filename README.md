# React Router Gospel stack with Turborepo

![The React Router Gospel Stack](https://repository-images.githubusercontent.com/533426847/134e6276-a6a8-41f1-94d3-f6dcb8f58b5f)

React Router TypeScript monorepo with Turborepo pipelines, Prisma, PostgreSQL OR SQLite (Turso), Docker deploy to Fly.io, pnpm, shadcn/ui TailwindCSS.

> [!IMPORTANT]  
> This used to be the remix-gospel-stack (Remix v2) but to follow remix merging back into react router, the stack was converted to **React Router v7+**. And the name was changed to `react-router-gospel-stack`.
>
> In this migration, we made other adjustments to the stack that reflects what I'm using
> in production SaaS apps:
>
> - Using Turso instead of LiteFS ([decision](./docs/why-turso-instead-of-litefs.md))
> - Dropping the NextJS app and the Vercel deployments (I was not using them so difficult to maintain)
> - We now use pnpm catalogs to define our versions in one file.

### Quickstart (recommended)

```bash
pnpm create remix@latest --init-script --install --template https://github.com/PhilDL/react-router-gospel-stack
```

> :minidisc: This repository is opiniated:
>
> - **TypeScript** only.
> - Only compatible with **pnpm** package manager to handle monorepo workspaces.
> - Uses turborepo pipelines + cache to build, lint, typecheck, and test the monorepo.

### (Alternative) Cloning the repository

```bash
git clone git@github.com:PhilDL/react-router-gospel-stack.git
cd react-router-gospel-stack
pnpm add -w @react-router/dev
pnpm remix init
```

## What's in the stack

This stack is a React Router oriented Monorepo powered by turborepo and [pnpm workspaces](https://pnpm.io/workspaces). Containing a ready-to-deploy React Router App on [fly.io](https://fly.io) via the building of a Docker container.

_This Package **uses `pnpm` as the package manager** of choice to manage workspaces. It may work with `yarn` and `npm` if you put the workspace definitions in the package.json file but there is no guarantee._

### Monorepo architecture powered by pnpm workspaces, and [Turborepo](https://turborepo.org/) cache:

- `apps` Folder containing the applications
  - [`webapp`](https://github.com/PhilDL/react-router-gospel-stack/tree/main/apps/webapp): the [React Router](https://reactrouter.com) app in ESM.
- `packages` Folder containing examples
  - [`ui`](https://github.com/PhilDL/react-router-gospel-stack/tree/main/packages/ui): a React UI package example powered by [shadcn/ui](https://ui.shadcn.com/). Some example components and shadcn/ui Tailwind config exported as Tailwind plugin and preset.
  - [`database`](https://github.com/PhilDL/react-router-gospel-stack/tree/main/packages/database): a [Prisma](https://prisma.io) wrapper ready to be used in other packages, or apps. Bundled with [tsup](https://tsup.egoist.dev/). Can be PostgreSQL or SQLite (Turso) depending on what you choose during installation.
  - [`business`](https://github.com/PhilDL/react-router-gospel-stack/tree/main/packages/business): an example package using the Prisma `database` as a dependency and using a _repository pattern_ like example.
  - [`internal-nobuild`](https://github.com/PhilDL/react-router-gospel-stack/tree/main/packages/internal-nobuild): an example package that is pure TypeScript with no build steps. The `main` entrypoint to the package is directly `src/index.ts`. React Router takes care of compiling with its own build step (with esbuild). This packages also contains unit test with Vitest.
    React Router uses `tsconfig.json` paths to reference to that project and its types. _I would recommend these types of **internal** packages when you don't plan on publishing the package._

- `config-packages`:
  - Eslint packages with different preset configs.
  - TS Configs, also with different presets.
  - [Tailwind 4](https://tailwindcss.com/) theme.

### What else ?

- React Router App [Multi-region Fly app deployment](https://fly.io/docs/reference/scaling/) with [Docker](https://www.docker.com/)
- Database comes in 2 flavors that you choose at install:
  - [Multi-region Fly PostgreSQL Cluster](https://fly.io/docs/getting-started/multi-region-databases/)
  - [Turso - Distributed SQLite with libSQL](https://turso.tech/)
- React Router App Healthcheck endpoint for [Fly backups region fallbacks](https://fly.io/docs/reference/configuration/#services-http_checks)
- [GitHub Actions](https://github.com/features/actions) for deploy the React Router App on merge to production and staging environments.
- End-to-end testing with [Playwright](https://github.com/microsoft/playwright) in the React Router App
- Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com) inside the different packages.
- Code formatting with [Prettier](https://prettier.io)
- Static Types with [TypeScript](https://typescriptlang.org)

> **Warning**
> All the following commands should be launched from the **monorepo root directory**

## Developement

- Install the dependencies.
  ```bash
  pnpm install
  ```
  You also have to copy the example .env.example:
  ```sh
  cp .env.example .env
  cp .env.example .env.docker
  ```
- Start the postgresql docker container

  ```bash
  pnpm run docker:db
  ```

  > **Note:** The npm script will complete while Docker sets up the container in the background. Ensure that Docker has finished and your container is running before proceeding.

- Generate prisma schema
  ```bash
  pnpm run generate
  ```
- Run the Prisma migration to the database
  
  **For PostgreSQL:**
  ```bash
  pnpm run db:migrate:deploy
  ```
  
  **For Turso:** Prisma migrations don't work directly with Turso. See the [Prisma Migrations with Turso](#important-prisma-migrations-with-turso) section below.
- Run the first build (with dependencies via the `...` option)
  ```bash
  pnpm run build --filter=@react-router-gospel-stack/webapp...
  ```
  **Running simply `pnpm run build` will build everything, including the NextJS app.**
- Run the React Router dev server
  ```bash
  pnpm run dev --filter=@react-router-gospel-stack/webapp
  ```

## Switch between PostgreSQL and SQLite (Turso)

- To switch between PostgreSQL and SQLite (Turso), there is a turbo generator you can use from the root of the repository.

  ```bash
  pnpm turbo gen scaffold-database
  ```

  Then follow the prompts. Be careful though, prisma migrations are linked to a specific database, so you will have to delete the `migrations` folder.

  > **Note:** You will probably have to run `pnpm run setup` again to generate the first migration after switching database types.

### Development with Turso

For local development, you can use a simple local SQLite file:

```sh
# .env
DATABASE_URL="file:./local.db"
# No need for DATABASE_SYNC_URL or DATABASE_AUTH_TOKEN in development
```

This gives you a standard SQLite database without the need for embedded replicas or remote connection during development.

### Important: Prisma Migrations with Turso

**Prisma's automatic migrations don't work with libSQL/Turso yet.** You need to manually apply the SQL migration files:

1. Generate migrations normally with Prisma:
   ```bash
   pnpm run db:migrate:dev
   ```

2. Prisma will create SQL files in `packages/database/prisma/migrations/`

3. Apply the migration to your Turso database manually:
   ```bash
   turso db shell <database-name> < packages/database/prisma/migrations/<migration-folder>/migration.sql
   ```

For production deployments, you'll need to apply migrations as part of your deployment process or manually before deploying.

## Create packages

### Internal package

```bash
turbo gen workspace --name @react-router-gospel-stack/foobarbaz --type package --copy
```

Then follow the prompts

## Tests, Typechecks, Lint, Install packages...

Check the `turbo.json` file to see the available pipelines.

- Run the Cypress tests and Dev
  ```bash
  pnpm run test:e2e:dev --filter=@react-router-gospel-stack/webapp
  ```
- Lint everything
  ```bash
  pnpm run lint
  ```
- Typecheck the whole monorepo
  ```bash
  pnpm run typecheck
  ```
- Test the whole monorepo
  ```bash
  pnpm run test
  or
  pnpm run test:dev
  ```
- How to install an npm package in the React Router app ?
  ```bash
  pnpm add dayjs --filter @react-router-gospel-stack/webapp
  ```
- Tweak the tsconfigs, eslint configs in the `config-package` folder. Any package or app will then extend from these configs.

## Deployement on fly.io – PostgreSQL

> **Warning**
> All the following commands should be launched from the **monorepo root directory**

Prior to your first deployment, you'll need to do a few things:

- First singup the fly CLI
  ```bash
  fly auth signup
  ```
- Create two apps on Fly, one for staging and one for production:

  ```sh
  fly apps create react-router-gospel-stack
  fly apps create react-router-gospel-stack-staging
  ```

  > **Note:** Once you've successfully created an app, double-check the `fly.toml` file to ensure that the `app` key is the name of the production app you created. This Stack [automatically appends a unique suffix at init](https://github.com/remix-run/blues-stack/blob/4c2f1af416b539187beb8126dd16f6bc38f47639/remix.init/index.js#L29) which may not match the apps you created on Fly. You will likely see [404 errors in your Github Actions CI logs](https://community.fly.io/t/404-failure-with-deployment-with-remix-blues-stack/4526/3) if you have this mismatch.

- Initialize Git.

  ```sh
  git init
  ```

- Create a new [GitHub Repository](https://repo.new), and then add it as the remote for your project. **Do not push your app yet!**

  ```sh
  git remote add origin <ORIGIN_URL>
  ```

- Add a `FLY_API_TOKEN` to your GitHub repo. To do this, go to your user settings on Fly and create a new [token](https://web.fly.io/user/personal_access_tokens/new), then add it to [your repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) with the name `FLY_API_TOKEN`.

- Create a database for both your staging and production environments:

### Turso Database creation

First, login to Turso:

```sh
turso auth login
```

Review your organizations, switch to the one you want to use:

```sh
turso org list
turso org switch <organization-name>
```

Create an auth token for the database:

```sh
turso db tokens create <database-name>
```

Keep this token safe, you will need to set it to the `DATABASE_AUTH_TOKEN` secret in the apps.

Create a database group:

```sh
turso group create <name-of-the-group>
```

Create a new database:

```sh
turso db create <database-name> --group <name-of-the-group>
```

Get the URL of the database:

```sh
turso db show --url <database-name>
```

Get the output URL and save it as `TURSO_DATABASE_URL` (this will be your sync URL for embedded replicas).

### Apply Prisma migrations manually to Turso

**Important:** Since Prisma's `migrate deploy` doesn't work with libSQL/Turso, you need to manually apply the SQL migration files:

1. First, generate your Prisma migration locally:
   ```sh
   pnpm run db:migrate:dev
   ```

2. Apply the generated SQL to your Turso database:
   ```sh
   turso db shell <database-name> < packages/database/prisma/migrations/<migration-folder>/migration.sql
   ```

3. Repeat for staging database:
   ```sh
   turso db shell <staging-database-name> < packages/database/prisma/migrations/<migration-folder>/migration.sql
   ```

> **Note:** For the initial setup, you'll typically have a migration like `20251027155525_first/migration.sql`. For subsequent migrations, apply each new migration SQL file in order.

## Deployement on fly.io – Turso (SQLite with libSQL)

> **Warning**
> All the following commands should be launched from the **monorepo root directory**

Prior to your first deployment, you'll need to do a few things:

- First singup the fly CLI
  ```bash
  fly auth signup
  ```
- Create two apps on Fly, one for staging and one for production:

  ```sh
  fly apps create react-router-gospel-stack
  fly apps create react-router-gospel-stack-staging
  ```

  > **Note:** Once you've successfully created an app, double-check the `fly.toml` file to ensure that the `app` key is the name of the production app you created. This Stack [automatically appends a unique suffix at init](https://github.com/remix-run/blues-stack/blob/4c2f1af416b539187beb8126dd16f6bc38f47639/remix.init/index.js#L29) which may not match the apps you created on Fly. You will likely see [404 errors in your Github Actions CI logs](https://community.fly.io/t/404-failure-with-deployment-with-remix-blues-stack/4526/3) if you have this mismatch.

- Initialize Git.

  ```sh
  git init
  ```

- Create a new [GitHub Repository](https://repo.new), and then add it as the remote for your project. **Do not push your app yet!**

  ```sh
  git remote add origin <ORIGIN_URL>
  ```

- Add a `FLY_API_TOKEN` to your GitHub repo. To do this, go to your user settings on Fly and create a new [token](https://web.fly.io/user/personal_access_tokens/new), then add it to [your repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) with the name `FLY_API_TOKEN`.

#### Create volumes for embedded replicas

Turso uses embedded replicas for optimal performance - a local SQLite file that syncs with the remote Turso database. Create persistent volumes for both environments:

```sh
fly volumes create libsql_data --region cdg --size 1 --app react-router-gospel-stack
fly volumes create libsql_data --region cdg --size 1 --app react-router-gospel-stack-staging
```

> **Note:** Feel free to change the GB size based on your needs and the region of your choice (https://fly.io/docs/reference/regions/). If you do change the region, make sure you change the primary_region in fly.toml as well.

#### Set secrets in the apps

Set the database URL (local file path), sync URL, and auth token as secrets:

```sh
fly secrets set DATABASE_URL="file:/data/libsql/local.db" DATABASE_SYNC_URL=<database-sync-url> DATABASE_AUTH_TOKEN=<database-auth-token> --app react-router-gospel-stack

fly secrets set DATABASE_URL="file:/data/libsql/local.db" DATABASE_SYNC_URL=<staging-database-sync-url> DATABASE_AUTH_TOKEN=<staging-database-auth-token> --app react-router-gospel-stack-staging
```

> **Note:** `DATABASE_URL` is the local file path for the embedded replica, `DATABASE_SYNC_URL` is the remote sync URL from Turso, and `DATABASE_AUTH_TOKEN` is your authentication token.

#### Configure your Turso client with Embedded Replicas

The database client is already configured in `apps/webapp/app/db.server.ts`:

```typescript
import { createClient } from "@react-router-gospel-stack/database";

export const db = remember("db", () => {
  return createClient({
    url: env.DATABASE_URL,          // Local file path or remote URL
    authToken: env.DATABASE_AUTH_TOKEN,  // Optional in dev
    syncUrl: env.DATABASE_SYNC_URL,      // Optional in dev
  });
});
```

**Environment variables:**
- `DATABASE_URL`: `"file:./local.db"` in dev, `"file:/data/libsql/local.db"` on Fly.io
- `DATABASE_SYNC_URL`: Remote Turso URL (optional for local dev)
- `DATABASE_AUTH_TOKEN`: Turso auth token (optional for local dev)

> **Note:** In development, you can omit `DATABASE_SYNC_URL` and `DATABASE_AUTH_TOKEN` to use a purely local SQLite database.

For more information, see the [Turso Embedded Replicas documentation](https://docs.turso.tech/features/embedded-replicas/with-fly#embedded-replicas-on-fly).

#### Start coding!

Now that everything is set up you can commit and push your changes to your repo. Every commit to your `main` branch will trigger a deployment to your production environment, and every commit to your `dev` branch will trigger a deployment to your staging environment.

If you run into any issues deploying to Fly, make sure you've followed all of the steps above and if you have, then post as many details about your deployment (including your app name) to [the Fly support community](https://community.fly.io). They're normally pretty responsive over there and hopefully can help resolve any of your deployment issues and questions.

### Multi-region deploys

Once you have your site and database running in a single region, you can add more regions by following [Fly's Scaling](https://fly.io/docs/reference/scaling/) and [Multi-region PostgreSQL](https://fly.io/docs/getting-started/multi-region-databases/) docs.

Make certain to set a `PRIMARY_REGION` environment variable for your app. You can use `[env]` config in the `fly.toml` to set that to the region you want to use as the primary region for both your app and database.

#### Testing your app in other regions

Install the [ModHeader](https://modheader.com/) browser extension (or something similar) and use it to load your app with the header `fly-prefer-region` set to the region name you would like to test.

You can check the `x-fly-region` header on the response to know which region your request was handled by.

## GitHub Actions

We use GitHub Actions for continuous integration and deployment. Anything that gets into the `main` branch will be deployed to production after running tests/build/etc. Anything in the `dev` branch will be deployed to staging.

## Manually Build The Docker Image to deploy with Fly.io

- Create a docker network
  ```
  docker network create app_network
  ```
- Build the docker image
  ```sh
  pnpm docker:build:webapp
  ```
- Run the docker Image
  ```sh
  pnpm docker:run:webapp
  ```
- (Optionnal) If you want to manually deploy to fly.io:
  ```bash
  DOCKER_DEFAULT_PLATFORM=linux/amd64 flyctl deploy --config ./apps/webapp/fly.toml --dockerfile ./apps/webapp/Dockerfile
  ```

## Useful Turborepo Links

Learn more about Turborepo features:

- [Pipelines](https://turborepo.org/docs/features/pipelines)
- [Caching](https://turborepo.org/docs/features/caching)
- [Remote Caching (Beta)](https://turborepo.org/docs/features/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/features/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)

## Thanks

- The ESM setup is heavily inspired by the [epic-stack](https://github.com/epicweb-dev/epic-stack) by [@kentcdodds](https://github.com/kentcdodds)
- Thanks to [@shadcn](https://github.com/shadcn) for the amazing [component library](https://github.com/shadcn/ui).
- The UI integration and some good practices were shamelessly borrowed from [@juliusmarminge](https://github.com/juliusmarminge) project [acme-corp monorepo](https://github.com/juliusmarminge/acme-corp)

## Support

If you found the template useful, please consider giving it a [Star ⭐](https://github.com/PhilDL/react-router-gospel-stack). Thanks you!

## Disclaimer

I am in no way an expert on Monorepo, Docker or CI. The setup proposed here is one of many and probably could be improved 10x, but I am learning by myself along the way, so if you see any possible improvement please submit a PR. I will appreciate it greatly !
