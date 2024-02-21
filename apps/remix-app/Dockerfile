# This file is moved to the root directory before building the image

ARG APP_DIRNAME=remix-app
ARG APP_PKG_NAME=@remix-gospel-stack/remix-app

FROM node:18-bookworm-slim AS pruner
ARG APP_PKG_NAME
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=$APP_PKG_NAME --docker
RUN find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

FROM node:18-bookworm-slim AS base
RUN apt-get update && apt-get install -y openssl
RUN corepack enable
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

FROM base AS dev-deps
WORKDIR /app
RUN pnpm install

FROM base AS production-deps
WORKDIR /app
ENV NODE_ENV production
RUN pnpm install --prod
COPY --from=pruner /app/out/full/packages/database/prisma/schema.prisma /app/packages/database/prisma/schema.prisma
RUN pnpm dlx prisma generate --schema /app/packages/database/prisma/schema.prisma

FROM base AS builder
ARG APP_PKG_NAME
WORKDIR /app
RUN corepack enable
ENV NODE_ENV production
COPY --from=pruner /app/out/full/ .
COPY --from=dev-deps /app/ .
COPY turbo.json turbo.json
RUN pnpm run generate
RUN pnpm run build --filter=$APP_PKG_NAME...


# Runner
FROM base AS runner
ARG APP_DIRNAME

ENV NODE_ENV production


COPY --from=pruner /app/out/full/ .
COPY --from=production-deps /app .
COPY --from=builder /app/apps/$APP_DIRNAME/server.mjs ./apps/$APP_DIRNAME/server.mjs
COPY --from=builder /app/apps/$APP_DIRNAME/build ./apps/$APP_DIRNAME/build
COPY --from=builder /app/apps/$APP_DIRNAME/public ./apps/$APP_DIRNAME/public

# release_command = "pnpx prisma migrate deploy --schema packages/database/prisma/schema.prisma"
CMD ["pnpm", "run", "start-remix-production"]
