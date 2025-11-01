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
  ```bash
  pnpm run db:migrate:deploy
  ```
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

###Turso Database creation:

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

Get the output url and save it as `DATABASE_URL` if you want to query directly from the remote database, or as `DATABASE_SYNC_URL` if you want to use embedded replica (recommended, in that case the DATABASE_URL will be a relative path on the volume).

### Apply the migration with prisma

```sh
turso db shell <database-name> < packages/database/prisma/migrations/20251027155525_first/migration.sql
```

> **Note:** You'll get the same warning for the same reason when attaching the staging database that you did in the `fly set secret` step above. No worries. Proceed!

Fly will take care of setting the `DATABASE_URL` secret for you.

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

Set the Turso database URL (syncUrl) and auth token as secrets:

```sh
fly secrets set TURSO_DATABASE_URL=<database-sync-url> TURSO_AUTH_TOKEN=<database-auth-token> --app react-router-gospel-stack

fly secrets set TURSO_DATABASE_URL=<staging-database-sync-url> TURSO_AUTH_TOKEN=<staging-database-auth-token> --app react-router-gospel-stack-staging
```

> **Note:** The `DATABASE_URL` will be set to a local file path (e.g., `file:/data/libsql/local.db`) in your environment configuration, while `TURSO_DATABASE_URL` is the remote sync URL from Turso.

#### Configure your Turso client

When using Turso with embedded replicas, configure your client in your database connection file:

```typescript
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL, // "file:/data/libsql/local.db" on Fly.io
  syncUrl: process.env.TURSO_DATABASE_URL, // Remote Turso URL
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60, // Sync every 60 seconds
});
```

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
