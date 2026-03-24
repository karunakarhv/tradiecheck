import { BasePage } from "./BasePage";
import { TradieCheckLocators } from "../locators/TradieCheckLocators";

export class TradieCheckPage extends BasePage {
  async visit() {
    await this.page.goto("/verifyTradie");
  }

  async verifyHeader() {
    return this.page.getByText(TradieCheckLocators.headerText);
  }

  getSearchInput() {
    return this.page.getByPlaceholder(TradieCheckLocators.searchInput);
  }

  getStateSelect() {
    return this.page.locator("select");
  }

  getCheckButton() {
    return this.page.getByRole("button", { name: TradieCheckLocators.checkButton });
  }

  getActiveElectricianChip() {
    return this.page.getByRole("button", { name: TradieCheckLocators.activeElectricianChip });
  }

  getExpiringPlumberChip() {
    return this.page.getByRole("button", { name: TradieCheckLocators.expiringPlumberChip });
  }

  getSuspendedBuilderChip() {
    return this.page.getByRole("button", { name: TradieCheckLocators.suspendedBuilderChip });
  }

  getNewSearchButton() {
    return this.page.getByRole("button", { name: TradieCheckLocators.newSearchButton });
  }

  getTryAgainButton() {
    return this.page.getByRole("button", { name: TradieCheckLocators.tryAgainButton });
  }

  async fillSearch(term: string) {
    await this.getSearchInput().fill(term);
  }

  async clickCheck() {
    await this.getCheckButton().click();
  }

  async searchByQuery(term: string) {
    await this.fillSearch(term);
    await this.clickCheck();
  }
}
export default TradieCheckPage;
