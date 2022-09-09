# Builder phase prune monorepo to keep only necessary
FROM node:16-bullseye-slim AS base
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=remix-app --docker

FROM node:16-bullseye-slim AS intermediate
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/yarn.lock ./yarn.lock
COPY --from=base /app/out/full/ .

FROM intermediate AS deps
WORKDIR /app
RUN yarn install

FROM intermediate AS production-deps
WORKDIR /app
RUN yarn install --production

# Installer
FROM intermediate AS builder
WORKDIR /app
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
COPY --from=builder --chown=remixjs:nodejs /app/apps/remix-app/server.js ./server.js
COPY --from=builder --chown=remixjs:nodejs /app/apps/remix-app/build ./build
COPY --from=builder --chown=remixjs:nodejs /app/apps/remix-app/public ./public

CMD ["node", "./server.js"]