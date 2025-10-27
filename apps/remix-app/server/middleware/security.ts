import { createMiddleware } from "hono/factory";
import { secureHeaders } from "hono/secure-headers";

import { env } from "~/env.server.ts";
import { IS_DEV } from "./misc.ts";

export const secureHeadersMiddleware = secureHeaders({
  referrerPolicy: "same-origin",
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    defaultSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: [
      "ws:",
      "wss:",
      IS_DEV ? "http://localhost:*" : null,
      IS_DEV ? "http://127.0.0.1:*" : null,
      process.env.SENTRY_DSN ? "*.sentry.io" : null,
      "data:",
      "blob:",
      "'self'",
      "https://inbound.giftup.app",
      "https://plausible.io",
      "https://*.uploadthing.com",
      `https://cdn.growthbook.io/sub/${env.GROWTHBOOK_CLIENT_KEY}`,
    ].filter(Boolean),
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    frameSrc: [
      "'self'",
      "https://cdn.giftup.app",
      "https://js.stripe.com",
      "https://hooks.stripe.com",
    ],
    imgSrc: [
      "'self'",
      "blob:",
      "data:",
      "https://atoly.s3.eu-west-3.amazonaws.com",
      "https://shuken.s3.eu-west-3.amazonaws.com",
      "https://res.cloudinary.com",
      "https://cdn.giftup.app",
      "https://cdnjs.cloudflare.com",
      "https://*.stripe.com",
      "https://utfs.io",
      "https://*.ufs.sh",
      "https://picsum.photos",
      "https://fastly.picsum.photos",
      "https://lh3.googleusercontent.com",
      "https://secure.gravatar.com",
    ],
    mediaSrc: ["'self'", "data:"],
    scriptSrc: [
      // this forces us to add nonce to the script tags
      "'strict-dynamic'",
      (c, _) => `'nonce-${c.get("cspNonce")}'`,
    ],
    scriptSrcAttr: [(c, _) => `'nonce-${c.get("cspNonce")}'`],
    //upgradeInsecureRequests: undefined,
  },
});

/** @public */
export const httpsOnly = createMiddleware(async (c, next) => {
  let url = new URL(c.req.url);
  if (url.protocol !== "http:") {
    return await next();
  }
  url.protocol = "https:";
  return c.redirect(url.toString(), 301);
});
