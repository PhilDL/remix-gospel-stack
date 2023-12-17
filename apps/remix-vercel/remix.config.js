/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // Vercel adapter don't need server and serveruildPath
  watchPaths: [
    "../../packages/ui/src/**/*",
    "../../packages/internal-nobuild/src/**/*",
  ],
  serverDependenciesToBundle: [
    "@remix-gospel-stack/internal-nobuild",
    "@remix-gospel-stack/ui",
  ],
  tailwind: true,
  postcss: true,
  future: {},
};
