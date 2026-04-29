import { test, expect } from "@playwright/test";
import TradieCheckPage from "../pages/TradieCheckPage";
import DashboardPage from "../pages/DashboardPage";
import MobilePage from "../pages/MobilePage";
import HelpPage from "../pages/HelpPage";

test.describe("Navigation via POM", () => {

  test("navigates to tradie check page", async ({ page }) => {
    const p = new TradieCheckPage(page);
    await p.visit();
    await expect(page).toHaveURL(/.*verifyTradie.*/);
    await expect(await p.verifyHeader()).toBeVisible();
  });

  test("navigates to dashboard page", async ({ page }) => {
    const p = new DashboardPage(page);
    await p.visit();
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test("navigates to mobile page", async ({ page }) => {
    const p = new MobilePage(page);
    await p.visit();
    await expect(page).toHaveURL(/.*mobile.*/);
  });

  test("navigates to help page", async ({ page }) => {
    const p = new HelpPage(page);
    await p.visit();
    await expect(page).toHaveURL(/.*help.*/);
  });

  test("navigates to api-config page", async ({ page }) => {
    await page.goto("/api-config");
    await expect(page).toHaveURL(/.*api-config.*/);
  });
});

