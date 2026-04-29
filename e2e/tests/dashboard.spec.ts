import { test, expect } from "@playwright/test";
import DashboardPage from "../pages/DashboardPage";

test.describe("Dashboard Page", () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.visit();
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test("loads the dashboard heading and components", async () => {
    await expect(dashboardPage.getDashboardHeading()).toBeVisible();
  });
});
