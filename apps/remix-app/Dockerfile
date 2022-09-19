# Builder phase prune monorepo to keep only necessary
FROM node:16-bullseye-slim AS base
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY .gitignore .gitignore
COPY ./out/json/ .
COPY ./out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY ./out/full/ .
RUN find . -name "node_modules" -type d -prune -exec rm -rf '{}' +


FROM base AS builder
WORKDIR /app
RUN corepack enable
RUN pnpm install
COPY turbo.json turbo.json
RUN pnpm run generate --filter=database
RUN pnpm run build --filter=remix-app...

FROM base AS production-deps
WORKDIR /app
RUN corepack enable
RUN pnpm install --prod
RUN pnpx prisma generate --schema /app/packages/database/prisma/schema.prisma


# Runner
FROM node:16-bullseye-slim AS runner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN corepack enable
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remixjs
RUN chown -R remixjs:nodejs /app
USER remixjs

COPY --from=production-deps --chown=remixjs:nodejs /app .
COPY --from=builder --chown=remixjs:nodejs /app/apps/remix-app/build/server.js ./apps/remix-app/build/server.js
COPY --from=builder --chown=remixjs:nodejs /app/apps/remix-app/build ./apps/remix-app/build
COPY --from=builder --chown=remixjs:nodejs /app/apps/remix-app/public ./apps/remix-app/public

# release_command = "pnpx prisma migrate deploy --schema packages/database/prisma/schema.prisma"
CMD ["pnpm", "--filter", "remix-app", "run", "start"]