import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  globalSetup: "./e2e/global-setup",
  use: {
    baseURL: "http://localhost:5173",
    storageState: "e2e/.auth/user.json",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /.*mobile\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-ios",
      testMatch: /.*mobile\.spec\.ts/,
      // Spread device profile (viewport, userAgent, touch) but override the
      // defaultBrowserType so this project runs on Chromium, which is already
      // installed in CI.  WebKit requires separate installation + system deps
      // on Linux and isn't available in the ubuntu-latest runner by default.
      use: {
        viewport: devices["iPhone 12"].viewport,
        userAgent: devices["iPhone 12"].userAgent,
        deviceScaleFactor: devices["iPhone 12"].deviceScaleFactor,
        isMobile: devices["iPhone 12"].isMobile,
        hasTouch: devices["iPhone 12"].hasTouch,
      },
    },
    {
      name: "mobile-android",
      testMatch: /.*mobile\.spec\.ts/,
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
