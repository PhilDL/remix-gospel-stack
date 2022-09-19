# Builder phase prune monorepo to keep only necessary
FROM node:16-bullseye-slim AS base
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY .gitignore .gitignore
COPY ./out/json/ .
COPY ./out/yarn.lock ./yarn.lock


FROM base AS deps
WORKDIR /app
RUN yarn install

FROM base AS production-deps
WORKDIR /app
RUN yarn install --production

# Installer
FROM base AS builder
WORKDIR /app
COPY ./out/full/ .
COPY --from=deps /app/node_modules ./node_modules
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=remix-app...


# Runner
FROM node:16-bullseye-slim AS runner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
# ENV NODE_ENV production
# ENV DATABASE_URL "mysql://root@host.docker.internal:3306/turborepo"
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remixjs
USER remixjs

COPY --from=production-deps --chown=remixjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=remixjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder --chown=remixjs:nodejs /app/packages ./packages
COPY --from=builder --chown=remixjs:nodejs /app/apps/remix-app/build/server.js ./server.js
COPY --from=builder --chown=remixjs:nodejs /app/apps/remix-app/build ./build
COPY --from=builder --chown=remixjs:nodejs /app/apps/remix-app/public ./public

CMD ["node", "./build/server.js"]