import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      // serverDependenciesToBundle: [],
      // watchPaths: [
      //   "../../packages/ui/src/**/*",
      //   "../../packages/business/src/**/*",
      //   "../../packages/database/src/**/*",
      //   "../../packages/internal-nobuild/src/**/*",
      // ],
      // tailwind: true,
      // postcss: true,
      serverModuleFormat: "esm",
    }),
    tsconfigPaths(),
  ],
});
