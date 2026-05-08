import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { reactRouterHonoServer } from "react-router-hono-server/dev"; // add this
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    reactRouterHonoServer({
      serverEntryPoint: "./server",
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
