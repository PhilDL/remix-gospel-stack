/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverDependenciesToBundle: [/@my-business\/.*/],
  watchPaths: async () => {
    return ["../../packages/ui/src/**/*", "../../packages/business/src/**/*", "../../packages/database/src/**/*"];
  },
};
