import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import HelpPage from "../pages/HelpPage";
import * as dotenv from "dotenv";
dotenv.config();

test.describe("Help Page", () => {
  let helpPage: HelpPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.TEST_EMAIL || "",
      process.env.TEST_PASSWORD || ""
    );
    await expect(page).toHaveURL(/.*welcome.*/);
    
    helpPage = new HelpPage(page);
    await helpPage.visit();
    await expect(page).toHaveURL(/.*help.*/);
  });

  test("loads the help & support structure properly", async () => {
    await expect(helpPage.getHelpHeading()).toBeVisible();
  });
});
