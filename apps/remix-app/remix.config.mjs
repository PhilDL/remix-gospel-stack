/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverDependenciesToBundle: [
    "@remix-gospel-stack/internal-nobuild",
    "@remix-gospel-stack/database",
    "@remix-gospel-stack/business",
    "@remix-gospel-stack/ui",
  ],
  watchPaths: [
    "../../packages/ui/src/**/*",
    "../../packages/business/src/**/*",
    "../../packages/database/src/**/*",
    "../../packages/internal-nobuild/src/**/*",
  ],
  future: {
    v2_routeConvention: true,
    v2_normalizeFormMethod: true,
    v2_meta: true,
    v2_errorBoundary: true,
  },
  serverModuleFormat: "cjs",
};
