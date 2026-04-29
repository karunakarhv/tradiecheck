import { test, expect } from "@playwright/test";

test.describe("API Rate Limiting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/verifyTradie");
  });

  test("shows rate limit banner when API returns 429", async ({ page }) => {
    await page.route("**/api/check**", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Too many requests. You may make at most 20 searches per minute. Please try again later.",
        }),
      });
    });

    await page.fill('input[placeholder*="Name"]', "John Smith");
    await page.click('button:has-text("CHECK")');

    const banner = page.locator("#rate-limit-banner");
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toContainText("Too many requests");
  });

  test("rate limit banner has a NEW SEARCH button that resets the UI", async ({ page }) => {
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

    await page.locator("#rate-limit-banner button").click();
    await expect(page.locator("#rate-limit-banner")).not.toBeVisible();
  });
});
