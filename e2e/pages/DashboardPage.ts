import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  async visit() {
    await this.page.goto("/dashboard");
  }

  getWelcomeText() {
    return this.page.getByText(/Welcome back/i);
  }

  getDashboardHeading() {
    return this.page.getByText("Tradie Dashboard");
  }
}
export default DashboardPage;
