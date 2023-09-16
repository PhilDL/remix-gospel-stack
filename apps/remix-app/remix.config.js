/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverDependenciesToBundle: [],
  watchPaths: [
    "../../packages/ui/src/**/*",
    "../../packages/business/src/**/*",
    "../../packages/database/src/**/*",
    "../../packages/internal-nobuild/src/**/*",
  ],
  tailwind: true,
  postcss: true,
  serverModuleFormat: "esm",
};
