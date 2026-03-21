import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import * as dotenv from "dotenv"; // or import dotenv from 'dotenv';
dotenv.config();

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.TEST_EMAIL || "";
    const password = process.env.TEST_PASSWORD || "";
    const loginPage = new LoginPage(page);
    await loginPage.login(email, password);
    await expect(page).toHaveURL("/welcome");
    const tradieChecklink = page.getByRole("link", { name: "Verify a Tradie" });
    await tradieChecklink.click({ timeout: 10000 });
  });

  test("navigates to tradie check page", async ({ page }) => {
    await page.goto("/verifyTradie");
    await expect(page).toHaveURL("/verifyTradie");
  });

  test("navigates to dashboard page", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
  });

  test("navigates to mobile page", async ({ page }) => {
    await page.goto("/mobile");
    await expect(page).toHaveURL("/mobile");
  });

  test("navigates to help page", async ({ page }) => {
    await page.goto("/help");
    await expect(page).toHaveURL("/help");
  });

  test("navigates to api-config page", async ({ page }) => {
    await page.goto("/api-config");
    await expect(page).toHaveURL("/api-config");
  });
});
