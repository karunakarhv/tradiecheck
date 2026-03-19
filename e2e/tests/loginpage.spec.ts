import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import * as dotenv from "dotenv"; // or import dotenv from 'dotenv';
dotenv.config();

test.describe("Login Features", async () => {
  test("allows user to login with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.TEST_EMAIL || "",
      process.env.TEST_PASSWORD || "",
    );
    await expect(page).toHaveURL("/welcome");

    await loginPage.logout();
    await expect(page).toHaveURL("/login");
  });

  test("allows user not to login with invalid credentials", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.INVALID_EMAIL || "",
      process.env.INVALID_PASSWORD || "",
    );

    await expect(
      page.getByText("Invalid login credentials", {
        exact: true,
      }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL("/login");
  });
});
