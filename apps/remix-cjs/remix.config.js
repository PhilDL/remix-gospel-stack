/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // Vercel adapter don't need server and serveruildPath
  watchPaths: [
    "../../packages/ui/src/**/*",
    "../../packages/internal-nobuild/src/**/*",
  ],
  serverDependenciesToBundle: [],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  serverModuleFormat: "cjs",
  tailwind: true,
  postcss: true,
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
};
