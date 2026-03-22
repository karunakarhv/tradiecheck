import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import * as dotenv from "dotenv";
dotenv.config();

test.describe("Dashboard Page", () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.TEST_EMAIL || "",
      process.env.TEST_PASSWORD || ""
    );
    await expect(page).toHaveURL(/.*welcome.*/);
    
    dashboardPage = new DashboardPage(page);
    await dashboardPage.visit();
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test("loads the dashboard heading and components", async () => {
    await expect(dashboardPage.getDashboardHeading()).toBeVisible();
  });
});
