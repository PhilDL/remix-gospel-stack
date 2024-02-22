import crypto from "crypto";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import { ip } from "address";
import chalk from "chalk";
import closeWithGrace from "close-with-grace";
import compression from "compression";
import express from "express";
import getPort, { portNumbers } from "get-port";
// import helmet from "helmet";
import morgan from "morgan";

installGlobals();

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const app = express();

const getHost = (req) => req.get("X-Forwarded-Host") ?? req.get("host") ?? "";

// ensure HTTPS only (X-Forwarded-Proto comes from Fly)
app.use((req, res, next) => {
  const proto = req.get("X-Forwarded-Proto");
  const host = getHost(req);
  if (proto === "http") {
    res.set("X-Forwarded-Proto", "https");
    res.redirect(`https://${host}${req.originalUrl}`);
    return;
  }
  next();
});

// no ending slashes for SEO reasons
// https://github.com/epicweb-dev/epic-stack/discussions/108
app.use((req, res, next) => {
  if (req.path.endsWith("/") && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1).replace(/\/+/g, "/");
    res.redirect(301, safepath + query);
  } else {
    next();
  }
});

app.use(compression());
// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
  morgan.token("url", (req, _res) => decodeURIComponent(req.url ?? ""));
  app.use(morgan("tiny"));
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use((_, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
});

app.all(
  "*",
  createRequestHandler({
    // @ts-expect-error
    build: viteDevServer
      ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
      : await import("./build/server/index.js"),
  }),
);

const desiredPort = Number(process.env.PORT || 3000);
const portToUse = await getPort({
  port: portNumbers(desiredPort, desiredPort + 100),
});

const server = app.listen(portToUse, () => {
  const addy = server.address();
  const portUsed =
    desiredPort === portToUse
      ? desiredPort
      : addy && typeof addy === "object"
        ? addy.port
        : 0;

  if (portUsed !== desiredPort) {
    console.warn(
      chalk.yellow(
        `⚠️  Port ${desiredPort} is not available, using ${portUsed} instead.`,
      ),
    );
  }
  console.log(`🎹 Server ready! - ${process.env.NODE_ENV} mode`);
  const localUrl = `http://localhost:${portUsed}`;
  let lanUrl = null;
  const localIp = ip();
  // Check if the address is a private ip
  // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
  // https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-dev-utils/WebpackDevServerUtils.js#LL48C9-L54C10
  if (
    localIp &&
    /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)
  ) {
    lanUrl = `http://${localIp}:${portUsed}`;
  }

  console.log(
    `
${chalk.bold("Local:")}            ${chalk.cyan(localUrl)}
${lanUrl ? `${chalk.bold("On Your Network:")}  ${chalk.cyan(lanUrl)}` : ""}
${chalk.bold("Press Ctrl+C to stop")}
    `.trim(),
  );
});

closeWithGrace(async ({ err }) => {
  // log the error early
  if (err) {
    console.error(chalk.red(err));
    console.error(chalk.red(err.stack));
  }

  // close up things
  await new Promise((resolve, reject) => {
    server.close((e) => (e ? reject(e) : resolve("ok")));
  });

  // if there was an error, then exit with a failure code
  if (err) {
    process.exit(1);
  }
});
