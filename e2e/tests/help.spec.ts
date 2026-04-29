import { test, expect } from "@playwright/test";
import HelpPage from "../pages/HelpPage";

test.describe("Help Page", () => {
  let helpPage: HelpPage;

  test.beforeEach(async ({ page }) => {
    helpPage = new HelpPage(page);
    await helpPage.visit();
    await expect(page).toHaveURL(/.*help.*/);
  });

  test("loads the help & support structure properly", async () => {
    await expect(helpPage.getHelpHeading()).toBeVisible();
  });
});
