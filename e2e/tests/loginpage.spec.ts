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
  test("login button is disabled if email is empty", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    await loginPage.fillPassword("mockpassword123");
    
    // Check if the button is disabled right away instead of clicking
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test("login button is disabled if password is empty", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    await loginPage.fillEmail("test@example.com");
    
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test("prevents login submission if email is malformed", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    await loginPage.fillEmail("not-an-email-format");
    await loginPage.fillPassword("mockpassword123");
    
    // The button is enabled, but clicking it should be blocked by HTML5 form validation
    await loginPage.submit();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test("toggles password visibility when eye icon is clicked", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    await loginPage.fillPassword("secret123");
    
    const pwInput = loginPage.getPasswordInput();
    await expect(pwInput).toHaveAttribute("type", "password");
    
    // Click to show
    await loginPage.getEyeToggle().click();
    await expect(pwInput).toHaveAttribute("type", "text");
    
    // Click to hide
    await loginPage.getEyeToggle().click();
    await expect(pwInput).toHaveAttribute("type", "password");
  });

  test("navigates to forgot password flow", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    
    await loginPage.getForgotPasswordLink().click();
    await expect(loginPage.getPageTitle()).toHaveText("Reset password");
    
    // Verify back link works
    await loginPage.getBackToSignInLink().click();
    await expect(loginPage.getPageTitle()).toHaveText("Sign in");
  });

  test("navigates to create account flow", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    
    await loginPage.getCreateAccountLink().click();
    await expect(loginPage.getPageTitle()).toHaveText("Create account");
    
    // Verify switch back works
    await loginPage.getSignInInsteadLink().click();
    await expect(loginPage.getPageTitle()).toHaveText("Sign in");
  });

  test("google oauth button is visible and active", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    
    const googleBtn = loginPage.getGoogleAuthButton();
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toBeEnabled();
  });
});
