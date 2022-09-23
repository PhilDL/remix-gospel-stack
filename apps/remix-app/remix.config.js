/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverDependenciesToBundle: ["@my-company/internal-nobuild"],
  watchPaths: async () => {
    return [
      "../../packages/ui/src/**/*",
      "../../packages/business/src/**/*",
      "../../packages/database/src/**/*",
      "../../packages/internal-nobuild/src/**/*",
    ];
  },
};
