# Remix Gospel stack with Turborepo

![The Remix Gospel Stack](https://repository-images.githubusercontent.com/533426847/134e6276-a6a8-41f1-94d3-f6dcb8f58b5f)

Remix TypeScript monorepo with Turborepo pipelines, Prisma, PostgreSQL, Docker deploy to Fly.io, pnpm, TailwindCSS and Tsyringe for DI.

### Quickstart (recommended)

```bash
pnpx create-remix@latest --install --typescript --template https://github.com/PhilDL/remix-gospel-stack
```

> :minidisc: This repository is opiniated:
>
> - **TypeScript** only, if you choose JavaScript nothing will happen.
> - Only compatible with **pnpm** package manager to handle monorepo workspaces.

### (Alternative) Cloning the repository

```bash
git clone git@github.com:PhilDL/remix-gospel-stack.git
cd remix-gospel-stack
pnpm add -w @remix-run/dev
pnpm remix init
```

## What's in the stack

This stack is a Remix oriented Monorepo powered by turborepo abd [pnpm workspaces](https://pnpm.io/workspaces). Containing a ready-to-deploy Remix App on [fly.io](https://fly.io) via the building of a Docker container.

_This Package **uses `pnpm` as the package manager** of choice to manage workspaces. It may work with `yarn` and `npm` if you put the workspace definitions in the package.json file but there is no guarantee._

### Monorepo architecture powered by [Turborepo](https://turborepo.org/) and pnpm workspaces:

- `apps` Folder containing the applications
  - [`remix-app`](https://github.com/PhilDL/remix-gospel-stack/tree/main/apps/remix-app): the [Remix.run](https://remix.run) app
  - [`nextjs-app`](https://github.com/PhilDL/remix-gospel-stack/tree/main/apps/nextjs-app): a [Next.js](https://nextjs.org) app
- `packages` Folder containing examples

  - [`database`](https://github.com/PhilDL/remix-gospel-stack/tree/main/packages/database): a [Prisma](https://prisma.io) wrapper ready to be used in other packages, or apps. Bundled with [tsup](https://tsup.egoist.dev/).
  - [`business`](https://github.com/PhilDL/remix-gospel-stack/tree/main/packages/business): an example package using [Tsyringe](https://github.com/microsoft/tsyringe) to inject the Prisma `database` as a dependency and using a _repository pattern_ like example.
  - [`internal-nobuild`](https://github.com/PhilDL/remix-gospel-stack/tree/main/packages/internal-nobuild): an example package that is pure TypeScript with no build steps. The `main` entrypoint to the package is directly `src/index.ts`. Remix takes care of compiling with its own build step (with esbuild). This packages also contains unit test with Vitest.
    Remix uses `tsconfig.json` paths to reference to that project and its types. _I would recommend these types of **internal** packages when you don't plan on publishing the package._
  - [`ui`](https://github.com/PhilDL/remix-gospel-stack/tree/main/packages/ui): a dummy React UI library (which contains a single `<Button>` component), build with tsup.

- `config-packages`:
  - Eslint packages with different preset configs.
  - TS Configs, also with different presets.
  - [Tailwind](https://tailwindcss.com/) configs.

### What else ?

- Remix App [Multi-region Fly app deployment](https://fly.io/docs/reference/scaling/) with [Docker](https://www.docker.com/)
- Database [Multi-region Fly PostgreSQL Cluster](https://fly.io/docs/getting-started/multi-region-databases/)
- Remix App Healthcheck endpoint for [Fly backups region fallbacks](https://fly.io/docs/reference/configuration/#services-http_checks)
- [GitHub Actions](https://github.com/features/actions) for deploy the Remix App on merge to production and staging environments.
- End-to-end testing with [Cypress](https://cypress.io) in the Remix App
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
  pnpm run build --filter=@remix-gospel-stack/remix-app...
  ```
  **Running simply `pnpm run build` will build everything, including the NextJS app.**
- Run the Remix dev server
  ```bash
  pnpm run dev --filter=@remix-gospel-stack/remix-app
  ```

## Create packages

### Internal package

```bash
turbo gen workspace --name @remix-gospel-stack/foobarbaz --type package --copy
```

Then follow the prompts

## Tests, Typechecks, Lint, Install packages...

Check the `turbo.json` file to see the available pipelines.

- Run the Cypress tests and Dev
  ```bash
  pnpm run test:e2e:dev --filter=@remix-gospel-stack/remix-app
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
- How to install an npm package in the Remix app ?
  ```bash
  pnpm add dayjs --filter remix-app
  ```
- Tweak the tsconfigs, eslint configs in the `config-package` folder. Any package or app will then extend from these configs.

## Deployement

> **Warning**
> All the following commands should be launched from the **monorepo root directory**

### Setup Deployement to fly.io

Prior to your first deployment, you'll need to do a few things:

- First singup the fly CLI
  ```bash
  fly auth signup
  ```
- Create two apps on Fly, one for staging and one for production:

  ```sh
  fly apps create remix-gospel-stack
  fly apps create remix-gospel-stack-staging
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
- Create a database for both your staging and production environments. Run the following:

  ```sh
  fly postgres create --name remix-gospel-stack-db
  fly postgres attach --app remix-gospel-stack remix-gospel-stack-db

  fly postgres create --name remix-gospel-stack-staging-db
  fly postgres attach --app remix-gospel-stack-staging remix-gospel-stack-staging-db
  ```

  > **Note:** You'll get the same warning for the same reason when attaching the staging database that you did in the `fly set secret` step above. No worries. Proceed!

Fly will take care of setting the `DATABASE_URL` secret for you.

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
  pnpm docker:build:remix-app
  ```
- Run the docker Image
  ```sh
  pnpm docker:run:remix-app
  ```
- (Optionnal) If you want to manually deploy to fly.io:
  ```bash
  DOCKER_DEFAULT_PLATFORM=linux/amd64 flyctl deploy --config ./apps/remix-app/fly.toml --dockerfile ./apps/remix-app/Dockerfile
  ```

## Useful Turborepo Links

Learn more about the power of Turborepo:

- [Pipelines](https://turborepo.org/docs/features/pipelines)
- [Caching](https://turborepo.org/docs/features/caching)
- [Remote Caching (Beta)](https://turborepo.org/docs/features/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/features/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)

## Support

If you found the template useful, please consider giving it a [Star ⭐](https://github.com/PhilDL/remix-gospel-stack). Thanks you!

## Disclaimer

I am in no way an expert on Monorepo, Docker or CI. The setup proposed here is one of many and probably could be improved 10x, but I am learning by myself along the way, so if you see any possible improvement please submit a PR. I will appreciate it greatly !
