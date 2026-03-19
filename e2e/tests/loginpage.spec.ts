import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";

test.describe("Login Features", async () => {
  test("allows user to login with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login("test@test.com", "test$123");
    await expect(page).toHaveURL("/welcome");

    await loginPage.logout();
    await expect(page).toHaveURL("/login");
  });

  test("allows user not to login with invalid credentials", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login("test@test1.com", "test$123");

    await expect(
      page.getByText("Invalid login credentials", {
        exact: true,
      }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL("/login");
  });
});
