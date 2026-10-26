import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5173", trace: "retain-on-failure" },
  reporter: "list",
});
