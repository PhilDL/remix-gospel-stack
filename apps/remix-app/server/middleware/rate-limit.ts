import type { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { createMiddleware } from "hono/factory";

import { AUTH_ERROR_KEY } from "~/storage/auth.server";
import { getIp, getSession } from "@atoly/infrastructure/hono-node";
import { FORGOT_PASSWORD_PATH } from "~/constants";

const IS_PROD = process.env.NODE_ENV === "production";
const maxMultiple =
  !IS_PROD || process.env.PLAYWRIGHT_TEST_BASE_URL ? 10_000 : 1;

type RateLimit = Parameters<typeof rateLimiter>[0];

const rateLimitDefault: RateLimit = {
  windowMs: 60 * 1000,
  limit: 1000 * maxMultiple,
  keyGenerator: (c: Context) => getIp(c),
};

// in production, this is 10 requests per minute
const strongestRateLimit = rateLimiter({
  ...rateLimitDefault,
  limit: 10 * maxMultiple,
});

const rateLimiterPasswordReset = rateLimiter({
  ...rateLimitDefault,
  limit: 5 * maxMultiple,
  handler: (c) => {
    console.log("rate limit password reset");
    const session = getSession(c as any);
    session.flash(AUTH_ERROR_KEY, "Too many requests, please wait 1 minute");
    return c.redirect(FORGOT_PASSWORD_PATH);
  },
});

// in production, this is 100 requests per minute
const strongRateLimit = rateLimiter({
  ...rateLimitDefault,
  limit: 100 * maxMultiple,
});

const generalRateLimit = rateLimiter(rateLimitDefault);

// Middleware pour gérer les limitations
export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const path = c.req.url;
  const method = c.req.method;

  const strongPaths = ["/auth", "/contact"];

  // Vérification des méthodes et des chemins
  const isStrongPath = strongPaths.some((p) => path.includes(p));

  if (
    path.includes(FORGOT_PASSWORD_PATH) &&
    method !== "GET" &&
    method !== "HEAD"
  ) {
    return rateLimiterPasswordReset(c, next);
  }

  // Limitation de débit selon la méthode et le chemin
  if (method !== "GET" && method !== "HEAD") {
    return isStrongPath
      ? strongestRateLimit(c, next)
      : strongRateLimit(c, next);
  }

  // Cas spécial pour /verify
  if (path.includes("/verify")) {
    return strongestRateLimit(c, next);
  }

  // Limitation générale
  return generalRateLimit(c, next);
});
