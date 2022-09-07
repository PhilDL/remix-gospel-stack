# Builder phase prune monorepo to keep only necessary
FROM node:16-bullseye-slim AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=remix-app --docker

# Installer
FROM node:16-bullseye-slim AS installer
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install
# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=remix-app...
# Remove all node_modules, keep generated prisma cli only
RUN find ./node_modules -mindepth 1 ! -regex '^./node_modules/.prisma\(/.*\)?' -delete
# Rebuild node_modules for production
RUN yarn install --production

# Runner
FROM node:16-bullseye-slim AS runner
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ENV NODE_ENV production
# ENV DATABASE_URL "mysql://root@host.docker.internal:3306/turborepo"

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remixjs
USER remixjs

COPY --from=installer --chown=remixjs:nodejs /app/packages ./packages
COPY --from=installer --chown=remixjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=remixjs:nodejs /app/apps/remix-app/server.js ./server.js
COPY --from=installer --chown=remixjs:nodejs /app/apps/remix-app/build ./build
COPY --from=installer --chown=remixjs:nodejs /app/apps/remix-app/public ./public

CMD ["node", "./server.js"]