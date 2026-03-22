import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import MobilePage from "../pages/MobilePage";
import * as dotenv from "dotenv";
dotenv.config();

test.describe("Mobile Page", () => {
  let mobilePage: MobilePage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.TEST_EMAIL || "",
      process.env.TEST_PASSWORD || ""
    );
    await expect(page).toHaveURL(/.*welcome.*/);
    
    mobilePage = new MobilePage(page);
    await mobilePage.visit();
    await expect(page).toHaveURL(/.*mobile.*/);
  });

  test("loads the mobile application layout mockup successfully", async () => {
    await expect(mobilePage.getMobilePreviewText()).toBeVisible();
  });
});
