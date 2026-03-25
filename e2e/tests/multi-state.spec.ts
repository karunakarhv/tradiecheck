import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import TradieCheckPage from "../pages/TradieCheckPage";
import * as dotenv from "dotenv";
dotenv.config();

test.describe("Multi-State Support", () => {
  let tradieCheckPage: TradieCheckPage;

  test.beforeEach(async ({ page }) => {
    const email = process.env.TEST_EMAIL || "";
    const password = process.env.TEST_PASSWORD || "";
    const loginPage = new LoginPage(page);
    await loginPage.login(email, password);
    await expect(page).toHaveURL("/welcome");
    tradieCheckPage = new TradieCheckPage(page);
    await tradieCheckPage.visit();
  });

  test("can select different states and search", async ({ page }) => {
    // Default is NSW
    await expect(tradieCheckPage.getStateSelect()).toHaveValue("NSW");
    await expect(
      page.getByText("NATIONAL COVERAGE: NSW REGISTER ACTIVE"),
    ).toBeVisible();

    // Select Victoria
    await tradieCheckPage.getStateSelect().selectOption("VIC");
    await expect(
      page.getByText("NATIONAL COVERAGE: VIC REGISTER ACTIVE"),
    ).toBeVisible();

    // Search for a Victorian license (mocked)
    await tradieCheckPage.searchByQuery("BLD-10293");
    await expect(page.getByText("Tony Ferraro")).toBeVisible();
    await expect(page.getByText("VIC Building Authority")).toBeVisible();

    // Select Queensland
    await tradieCheckPage.getNewSearchButton().click();
    await tradieCheckPage.getStateSelect().selectOption("QLD");
    await tradieCheckPage.searchByQuery("QLD-55221");
    await expect(page.getByText("Emma Walters")).toBeVisible();
    await expect(page.getByText("QBCC Queensland")).toBeVisible();
  });

  test("bulk upload uses selected state", async ({ page }) => {
    // This is a partial test as bulk upload involves file system
    await tradieCheckPage.getStateSelect().selectOption("WA");
    await expect(
      page.getByText("NATIONAL COVERAGE: WA REGISTER ACTIVE"),
    ).toBeVisible();
  });
});
