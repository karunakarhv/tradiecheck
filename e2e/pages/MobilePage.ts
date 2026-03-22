import { BasePage } from "./BasePage";

export class MobilePage extends BasePage {
  async visit() {
    await this.page.goto("/mobile");
  }

  getMobilePreviewText() {
    return this.page.getByText(/app/i, { exact: false }).first();
  }
}
export default MobilePage;
