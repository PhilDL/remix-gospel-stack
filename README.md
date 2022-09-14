# Turborepo with Remix.run App

This is a work-in-progress turborepo with a Remix app building into a Dockerfile and deployed to fly.io



## Deployement

### Deploy to fly.io

> **Warning**
> All the following commands should be launched from the **monorepo root directory**

#### First singup the fly CLI

```bash
fly auth signup
```

#### Create the Fly apps

This monorepo uses postgresql Database so we have to create a database and attach it to our app

```bash
fly apps create turborepo-remix
fly postgres create --name turborepo-remix-db
fly postgres attach --postgres-app turborepo-remix-db --app turborepo-remix
```

#### Build and deploy image to Fly.io

```bash
DOCKER_DEFAULT_PLATFORM=linux/amd64 flyctl deploy --config ./apps/remix-app/fly.toml --dockerfile ./apps/remix-app/Dockerfile
```

### (Optional) If you want to build the Dockerfile in isolation

```bash
DOCKER_DEFAULT_PLATFORM=linux/amd64 flyctl deploy --config ./apps/remix-app/fly.toml --dockerfile ./apps/remix-app/Dockerfile
```

#### Run the Docker Image directly

```bash
docker run -it --init --rm -p 3000:3000 --env DATABASE_URL="postgresql://postgres:postgres@db:5432/postgres" --network=app_network turborepo-remix-app
```

- Replace the `@db` with the name of the postgres container.
- Here a network was created called `app_network`
  - To create a network docker `network create app_network`

---

> **Note**
> The rest of this README is basically copy pasted from official turbo repo examples:


## What's inside?

This turborepo includes the following packages/apps:

### Apps and Packages

- `nextjs-app`: a [Next.js](https://nextjs.org) app
- `remix-app`: a [Remix](https://remix.run) app
- `config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `database`: [Prisma](https://prisma.io/) ORM wrapper to manage & access your database
- `business`: Business package consuming the database package and using Tsyringe for dependency injection.
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Prisma](https://prisma.io/) for database ORM
- [Docker Compose](https://docs.docker.com/compose/) for local database

### Database

We use [Prisma](https://prisma.io/) to manage & access our database. As such you will need a database for this project, either locally or hosted in the cloud.

To make this process easier, we offer a [`docker-compose.yml`](https://docs.docker.com/compose/) file to deploy a MySQL server locally with a new database named `turborepo` (To change this update the `MYSQL_DATABASE` environment variable in the `docker-compose.yml` file):

```bash
cd my-turborepo
docker-compose up -d
```

Once deployed you will need to copy the `.env.example` file to `.env` in order for Prisma to have a `DATABASE_URL` environment variable to access.

```bash
cp .env.example .env
```

If you added a custom database name, or use a cloud based database, you will need to update the `DATABASE_URL` in your `.env` accordingly.

Once deployed & up & running, you will need to create & deploy migrations to your database to add the necessary tables. This can be done using [Prisma Migrate](https://www.prisma.io/migrate):

```bash
npx prisma migrate dev
```

If you need to push any existing migrations to the database, you can use either the Prisma db push or the Prisma migrate deploy command(s):

```bash
yarn run db:push

# OR

yarn run db:migrate:deploy
```

There is slight difference between the two commands & [Prisma offers a breakdown on which command is best to use](https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push#choosing-db-push-or-prisma-migrate).

An optional additional step is to seed some initial or fake data to your database using [Prisma's seeding functionality](https://www.prisma.io/docs/guides/database/seed-database).

To do this update check the seed script located in `packages/database/src/seed.ts` & add or update any users you wish to seed to the database.

Once edited run the following command to run tell Prisma to run the seed script defined in the Prisma configuration:

```bash
yarn run db:seed
```

For further more information on migrations, seeding & more, we recommend reading through the [Prisma Documentation](https://www.prisma.io/docs/).

### Build

To build all apps and packages, run the following command:

```bash
cd my-turborepo
yarn run build
```

### Develop

To develop all apps and packages, run the following command:

```bash
cd my-turborepo
yarn run dev
```

## Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turborepo.org/docs/features/pipelines)
- [Caching](https://turborepo.org/docs/features/caching)
- [Remote Caching (Beta)](https://turborepo.org/docs/features/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/features/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)
