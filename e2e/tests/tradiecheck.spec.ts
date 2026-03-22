import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import TradieCheckPage from "../pages/TradieCheckPage";
import * as dotenv from "dotenv";
dotenv.config();

test.describe("TradieCheck homepage", () => {
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

  test.afterEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.logout();
    await expect(page).toHaveURL("/login");
  });

  test("loads with search input and demo chips", async () => {
    await expect(await tradieCheckPage.verifyHeader()).toBeVisible();
    await expect(tradieCheckPage.getSearchInput()).toBeVisible();
    await expect(tradieCheckPage.getCheckButton()).toBeVisible();
    await expect(tradieCheckPage.getActiveElectricianChip()).toBeVisible();
    await expect(tradieCheckPage.getExpiringPlumberChip()).toBeVisible();
    await expect(tradieCheckPage.getSuspendedBuilderChip()).toBeVisible();
  });

  test("CHECK button is disabled with empty input", async () => {
    await expect(tradieCheckPage.getCheckButton()).toBeDisabled();
  });

  test("CHECK button enables when text is entered", async () => {
    await tradieCheckPage.fillSearch("LIC-48291");
    await expect(tradieCheckPage.getCheckButton()).toBeEnabled();
  });

  test("Active Electrician chip shows VERIFIED & ACTIVE result", async ({ page }) => {
    await tradieCheckPage.getActiveElectricianChip().click();
    await expect(page.getByText("VERIFIED & ACTIVE")).toBeVisible();
    await expect(page.getByText("Jake Morrison")).toBeVisible();
    await expect(page.getByText("Licensed Electrician")).toBeVisible();
    await expect(page.getByText("LIC-48291")).toBeVisible();
  });

  test("Expiring Plumber chip shows ACTIVE result with alert", async ({ page }) => {
    await tradieCheckPage.getExpiringPlumberChip().click();
    await expect(page.getByText("VERIFIED & ACTIVE")).toBeVisible();
    await expect(page.getByText("Sandra Okafor")).toBeVisible();
    await expect(page.getByText("Plumber & Drainer")).toBeVisible();
    await expect(page.getByText(/Licence expires soon/)).toBeVisible();
  });

  test("Suspended Builder chip shows SUSPENDED result with alerts", async ({ page }) => {
    await tradieCheckPage.getSuspendedBuilderChip().click();
    await expect(page.getByText("SUSPENDED", { exact: true })).toBeVisible();
    await expect(page.getByText("Tony Ferraro")).toBeVisible();
    await expect(page.getByText("Builder — General")).toBeVisible();
    await expect(page.getByText(/Licence suspended/)).toBeVisible();
  });

  test("searching by typing and pressing Enter shows result", async ({ page }) => {
    await tradieCheckPage.fillSearch("LIC-48291");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Jake Morrison")).toBeVisible();
  });

  test("searching via CHECK button shows result", async ({ page }) => {
    await tradieCheckPage.searchByQuery("BLD-10293");
    await expect(page.getByText("Tony Ferraro")).toBeVisible();
  });

  test("NEW SEARCH button resets to idle state", async ({ page }) => {
    await tradieCheckPage.getActiveElectricianChip().click();
    await expect(page.getByText("Jake Morrison")).toBeVisible();
    await tradieCheckPage.getNewSearchButton().click();
    await expect(page.getByText("Jake Morrison")).not.toBeVisible();
    await expect(tradieCheckPage.getCheckButton()).toBeVisible();
  });

  test("shows no results message when backend is unreachable", async ({ page }) => {
    await tradieCheckPage.searchByQuery("UNKNOWN-99999");
    await expect(page.getByText("No results found")).toBeVisible({ timeout: 10000 });
    await expect(tradieCheckPage.getTryAgainButton()).toBeVisible();
  });

  test("TRY AGAIN button resets to idle state", async ({ page }) => {
    await tradieCheckPage.searchByQuery("UNKNOWN-99999");
    await expect(page.getByText("No results found")).toBeVisible({ timeout: 10000 });
    await tradieCheckPage.getTryAgainButton().click();
    await expect(page.getByText("No results found")).not.toBeVisible();
    await expect(tradieCheckPage.getCheckButton()).toBeVisible();
  });
});
