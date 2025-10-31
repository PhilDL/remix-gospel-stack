import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("/healthcheck", "./routes/healthcheck.tsx"),
] satisfies RouteConfig;
