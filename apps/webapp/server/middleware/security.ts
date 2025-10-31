import { createMiddleware } from "hono/factory";
import { secureHeaders } from "hono/secure-headers";

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
    ].filter(Boolean),
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    frameSrc: ["'self'"],
    imgSrc: ["'self'", "blob:", "data:"],
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
