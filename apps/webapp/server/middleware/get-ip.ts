import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";

export const getIp = (c: Context) => {
  return (
    c.req.header("fly-client-ip") ??
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for") ??
    c.req.header("x-real-ip") ??
    getConnInfo(c).remote.address ??
    "unknown"
  );
};
