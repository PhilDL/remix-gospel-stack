import type { ServerBuild, Session, SessionStorage } from "react-router";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { createMiddleware } from "hono/factory";
import { poweredBy } from "hono/powered-by";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";
import { createHonoServer } from "react-router-hono-server/node";

import type { UserRepository } from "@react-router-gospel-stack/business/repositories";
import { resolveRepositories } from "@react-router-gospel-stack/infrastructure/repositories";

import { db } from "~/db.server.ts";
import { sessionStorage } from "~/session.server.ts";
import { appLogger } from "./middleware/logger.ts";
import { ALLOW_INDEXING, IS_DEV, IS_PROD } from "./middleware/misc.ts";
import { rateLimitMiddleware } from "./middleware/rate-limit.ts";
import {
  getSession,
  getSessionStorage,
  session,
  type SessionVariables,
} from "./middleware/session.ts";

const SENTRY_ENABLED = IS_PROD && process.env.SENTRY_DSN;

if (SENTRY_ENABLED) {
  void import("./utils/monitoring.ts").then(({ init }) => init());
}

if (process.env.MOCKS === "true" && IS_DEV) {
  await import("../tests/mocks/index.ts");
}

declare module "react-router" {
  interface AppLoadContext {
    readonly cspNonce: string;
    serverBuild: ServerBuild;
    session: Session;
    sessionStorage: SessionStorage;
    repositories: {
      user: UserRepository;
    };
  }
}

type HonoEnv = {
  Variables: SessionVariables & {
    cspNonce: string;
  };
};

const app = new Hono<HonoEnv>();

export default createHonoServer({
  app,
  defaultLogger: false,
  getLoadContext: async (c, { build }) => {
    let sessionStorage = getSessionStorage(c);
    let session = getSession(c);
    return {
      cspNonce: c.get("cspNonce"),
      serverBuild: build,
      session,
      sessionStorage,
      repositories: resolveRepositories(db),
    };
  },
  async beforeAll(app) {
    app.use(
      session({
        autoCommit: true,
        createSessionStorage() {
          return {
            ...sessionStorage,
            // If a user doesn't come back to the app within 30 days, their session will be deleted.
            async commitSession(session) {
              return sessionStorage.commitSession(session, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
              });
            },
          };
        },
      }),
    );
  },
  configure: (server) => {
    server.use("*", rateLimitMiddleware);
    server.use("*", requestId());
    server.use("*", appLogger());
    server.use(trimTrailingSlash());
    server.use("*", async (c, next) => {
      const proto = c.req.header("X-Forwarded-Proto");
      const host = c.req.header("Host");
      if (proto === "http") {
        const secureUrl = `https://${host}${c.req.url}`;
        return c.redirect(secureUrl, 301);
      }
      await next();
    });

    // server.use(cspNonceMiddleware);
    // server.use("*", secureHeadersMiddleware);

    server.use("*", poweredBy({ serverName: "Gospel Stack" }));
    server.on("GET", ["/favicons/*", "/img/*"], (c) => {
      return c.text("Not found", 404);
    });
    server.use(compress());
    if (!ALLOW_INDEXING) {
      server.use(
        createMiddleware(async (c, next) => {
          c.set("X-Robots-Tag", "noindex, nofollow");
          await next();
        }),
      );
    }
  },
});
