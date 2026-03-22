import { BasePage } from "./BasePage";
import { LoginPageLocators } from "../locators/LoginPageLocators";

export class LoginPage extends BasePage {
  async visit() {
    await this.page.goto("/login");
  }

  async fillEmail(email: string) {
    await this.page.locator(LoginPageLocators.emailInput).fill(email);
  }

  async fillPassword(password: string) {
    await this.page.locator(LoginPageLocators.passwordInput).fill(password);
  }

  async submit() {
    await this.page
      .locator(LoginPageLocators.submitButton)
      .click({ timeout: 10000 });
  }

  async login(email: string, password: string) {
    await this.visit();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async logout() {
    await this.page.locator(LoginPageLocators.logoutButton).click();
  }

  getPasswordInput() {
    return this.page.locator(LoginPageLocators.passwordInput);
  }

  getEyeToggle() {
    return this.page.locator(LoginPageLocators.eyeToggle);
  }

  getForgotPasswordLink() {
    return this.page.locator(LoginPageLocators.forgotPasswordLink);
  }

  getCreateAccountLink() {
    return this.page.locator(LoginPageLocators.createAccountLink);
  }

  getGoogleAuthButton() {
    return this.page.locator(LoginPageLocators.googleAuthButton);
  }

  getPageTitle() {
    return this.page.locator(LoginPageLocators.pageTitle);
  }

  getSignInInsteadLink() {
    return this.page.locator(LoginPageLocators.signInInsteadLink);
  }

  getBackToSignInLink() {
    return this.page.locator(LoginPageLocators.backToSignInLink);
  }
}
export default LoginPage;
