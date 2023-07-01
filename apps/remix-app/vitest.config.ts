/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { react } from "./tests/setup/vitejs-plugin-react.cjs";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["./app/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup/setup-test-env.ts"],
  },
});
