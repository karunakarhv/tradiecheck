import { BasePage } from "./BasePage";

export class HelpPage extends BasePage {
  async visit() {
    await this.page.goto("/help");
  }

  getHelpHeading() {
    return this.page.getByText("HELP CENTRE");
  }
}
export default HelpPage;
