import { defineConfig, devices } from "@playwright/test";

import "dotenv/config";

const PORT = process.env.PORT || "3000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    actionTimeout: 0,
    baseURL: `http://localhost:${PORT}/`,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: {
    command: process.env.CI
      ? `pnpm -w run start-remix-production`
      : `pnpm run dev`,
    port: Number(PORT),
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      PORT,
    },
  },
});
