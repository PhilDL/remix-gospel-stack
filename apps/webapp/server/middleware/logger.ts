import { createMiddleware } from "hono/factory";

import { getIp } from "./get-ip";

function formatDuration(duration: number) {
  if (duration < 1000) return `${duration.toFixed(2)}ms`;
  if (duration < 60000) return `${(duration / 1000).toFixed(2)}s`;
  if (duration < 3600000)
    return `${Math.floor(duration / 60000)}min ${((duration % 60000) / 1000).toFixed(2)}s`;
  return `${Math.floor(duration / 3600000)}h ${Math.floor((duration % 3600000) / 60000)}min`;
}

function getUrl(url: URL) {
  if (url.pathname === "/__manifest") return url.pathname;
  return url.pathname + url.search;
}

export const appLogger = (_logger?: { logName?: string }) =>
  createMiddleware(async (c, next) => {
    const start = performance.now();
    const colors = {
      reset: "\x1b[0m",
      bold: "\x1b[1m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      red: "\x1b[31m",
      cyan: "\x1b[36m",
      magenta: "\x1b[35m",
    };

    const method = c.req.method;
    const url = getUrl(new URL(c.req.url));

    await next();
    const duration = performance.now() - start;
    const status = c.res.status;

    const methodStyled = `${colors.bold}${method == "GET" ? colors.green : colors.yellow}${method}${colors.reset}`;
    const statusStyled = `${status >= 200 && status < 300 ? colors.green : status >= 400 && status < 500 ? colors.yellow : status >= 500 ? colors.red : colors.cyan}${status}${colors.reset}`;
    const formattedDuration = formatDuration(duration);

    const ip = getIp(c);

    console.log(
      `${new Date().toLocaleTimeString()} ${colors.cyan}[${ip}]${colors.reset} ${methodStyled} ${url} ${statusStyled} (${formattedDuration})`,
    );
  });
