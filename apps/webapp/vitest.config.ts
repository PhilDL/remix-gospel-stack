/// <reference types="vitest/config" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["./app/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup/setup-test-env.ts"],
  },
});
