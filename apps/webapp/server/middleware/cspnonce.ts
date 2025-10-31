import crypto from "node:crypto";
import { createMiddleware } from "hono/factory";

export const cspNonceMiddleware = createMiddleware<{
  Variables: { cspNonce: string };
}>(async (c, next) => {
  const nonce = crypto.randomBytes(16).toString("hex");
  c.set("cspNonce", nonce);
  await next();
});
