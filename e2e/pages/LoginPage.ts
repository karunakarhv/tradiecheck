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
    // Implement logout functionality if needed
    await this.page.getByRole("button", { name: "SIGN OUT" }).click();
  }
}
export default LoginPage;
