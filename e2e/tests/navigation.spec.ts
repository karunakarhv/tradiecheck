import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import TradieCheckPage from "../pages/TradieCheckPage";
import DashboardPage from "../pages/DashboardPage";
import MobilePage from "../pages/MobilePage";
import HelpPage from "../pages/HelpPage";
import * as dotenv from "dotenv";
dotenv.config();

test.describe("Navigation via POM", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.TEST_EMAIL || "",
      process.env.TEST_PASSWORD || ""
    );
    await expect(page).toHaveURL(/.*welcome.*/);
  });

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

