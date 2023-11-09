FROM node:18-bookworm-slim AS pruner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@remix-gospel-stack/remix-app --docker
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
WORKDIR /app
RUN corepack enable
ENV NODE_ENV production
COPY --from=pruner /app/out/full/ .
COPY --from=dev-deps /app/ .
COPY turbo.json turbo.json
RUN pnpm run generate
RUN pnpm run build --filter=@remix-gospel-stack/remix-app...

# Runner
FROM node:18-bookworm-slim AS runner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN corepack enable

ENV NODE_ENV production

COPY --from=pruner /app/out/full/ .
COPY --from=production-deps /app .
COPY --from=builder /app/apps/remix-app/index.js ./apps/remix-app/index.js
COPY --from=builder /app/apps/remix-app/build ./apps/remix-app/build
COPY --from=builder /app/apps/remix-app/public ./apps/remix-app/public
COPY --from=builder /app/apps/remix-app/server-build ./apps/remix-app/server-build

# release_command = "pnpx prisma migrate deploy --schema packages/database/prisma/schema.prisma"
CMD ["pnpm", "run", "start-remix-production"]