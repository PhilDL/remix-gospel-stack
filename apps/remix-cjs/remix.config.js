/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // Vercel adapter don't need server and serveruildPath
  watchPaths: [
    "../../packages/ui/src/**/*",
    "../../packages/internal-nobuild/src/**/*",
  ],
  serverDependenciesToBundle: ["tailwind-merge"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  serverModuleFormat: "cjs",
  tailwind: true,
  postcss: true,
  future: {},
};
