import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import * as dotenv from "dotenv";
dotenv.config();

test.describe("API Rate Limiting", () => {
  test("shows rate limit banner when API returns 429", async ({ page }) => {
    // Log in first
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.TEST_EMAIL || "",
      process.env.TEST_PASSWORD || ""
    );
    await expect(page).toHaveURL(/.*welcome.*/);

    // Navigate to the verify tradie page
    await page.goto("/verifyTradie");

    // Intercept the /api/check endpoint to simulate a 429 rate limit response
    await page.route("**/api/check**", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Too many requests. You may make at most 20 searches per minute. Please try again later.",
        }),
      });
    });

    // Trigger a search
    await page.fill('input[placeholder*="Name"]', "John Smith");
    await page.click('button:has-text("CHECK")');

    // The rate limit banner should appear
    const banner = page.locator("#rate-limit-banner");
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toContainText("Too many requests");
  });

  test("rate limit banner has a NEW SEARCH button that resets the UI", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.TEST_EMAIL || "",
      process.env.TEST_PASSWORD || ""
    );
    await expect(page).toHaveURL(/.*welcome.*/);
    await page.goto("/verifyTradie");

    // Intercept once to return 429
    await page.route("**/api/check**", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: "Too many requests." }),
      });
    });

    await page.fill('input[placeholder*="Name"]', "Test Tradie");
    await page.click('button:has-text("CHECK")');
    await expect(page.locator("#rate-limit-banner")).toBeVisible({ timeout: 5000 });

    // Click NEW SEARCH — banner should disappear
    await page.locator("#rate-limit-banner button").click();
    await expect(page.locator("#rate-limit-banner")).not.toBeVisible();
  });
});
