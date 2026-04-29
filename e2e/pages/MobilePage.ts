import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { MobileLocators } from "../locators/MobileLocators";

export class MobilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async visit() {
    await this.page.goto("/mobile");
  }

  // ── HomeScreen ────────────────────────────────────────────────────

  getSearchInput() {
    return this.page.getByPlaceholder(MobileLocators.searchPlaceholder);
  }

  getQuickTryActiveButton() {
    return this.page.getByRole("button", { name: MobileLocators.quickTryActive, exact: true });
  }

  getQuickTryExpiringButton() {
    return this.page.getByRole("button", { name: MobileLocators.quickTryExpiring, exact: true });
  }

  getQuickTrySuspendedButton() {
    return this.page.getByRole("button", { name: MobileLocators.quickTrySuspended, exact: true });
  }

  getJakeMorrisonRecentItem() {
    return this.page.getByRole("button", { name: MobileLocators.jakeMorrisonName });
  }

  getSandraOkaforRecentItem() {
    return this.page.getByRole("button", { name: MobileLocators.sandraOkaforName });
  }

  getScanLicenceCard() {
    return this.page.getByText(MobileLocators.scanLicenceTitle);
  }

  getOpenCameraButton() {
    return this.page.getByText(MobileLocators.openCameraButton);
  }

  getTabHome()    { return this.page.getByText(MobileLocators.tabHome,    { exact: true }); }
  getTabSearch()  { return this.page.getByText(MobileLocators.tabSearch,  { exact: true }); }
  getTabSaved()   { return this.page.getByText(MobileLocators.tabSaved,   { exact: true }); }
  getTabProfile() { return this.page.getByText(MobileLocators.tabProfile, { exact: true }); }

  // ── LoadingScreen ─────────────────────────────────────────────────

  getLoadingText() {
    return this.page.getByText(MobileLocators.checkingDatabasesText);
  }

  // ── ResultScreen ──────────────────────────────────────────────────

  getVerificationResultLabel() {
    return this.page.getByText(MobileLocators.verificationResultLabel);
  }

  getLicenceActiveVerifiedBadge() {
    return this.page.getByText(MobileLocators.licenceActiveVerified);
  }

  getLicenceSuspendedBadge() {
    return this.page.getByText(MobileLocators.licenceSuspended, { exact: true });
  }

  getCheckLicenceCell()   { return this.page.getByText(MobileLocators.checkLicenceLabel,   { exact: true }); }
  getCheckHighRiskCell()  { return this.page.getByText(MobileLocators.checkHighRiskLabel,  { exact: true }); }
  getCheckAsbestosCell()  { return this.page.getByText(MobileLocators.checkAsbestosLabel,  { exact: true }); }
  getCheckInsuranceCell() { return this.page.getByText(MobileLocators.checkInsuranceLabel, { exact: true }); }

  getLicenceNumberLabel()    { return this.page.getByText(MobileLocators.licenceNumberLabel,    { exact: true }); }
  getIssuingAuthorityLabel() { return this.page.getByText(MobileLocators.issuingAuthorityLabel, { exact: true }); }
  getLicensedSinceLabel()    { return this.page.getByText(MobileLocators.licensedSinceLabel,    { exact: true }); }
  getExpiryDateLabel()       { return this.page.getByText(MobileLocators.expiryDateLabel,       { exact: true }); }

  // Back button: <button> containing the left-arrow SVG (path starts "M19 12H5")
  getBackButton() {
    return this.page.locator("button").filter({
      has: this.page.locator("svg path[d*='M19 12H5']"),
    });
  }

  getSaveVerificationReportButton() {
    return this.page.getByRole("button", { name: MobileLocators.saveVerificationReport });
  }

  // ── Outer layout ──────────────────────────────────────────────────

  getHomeLinkAnchor() {
    return this.page.getByRole("link", { name: MobileLocators.homeLink });
  }

  // ── Composite actions ─────────────────────────────────────────────

  async typeInSearch(text: string) {
    await this.getSearchInput().fill(text);
  }

  async submitSearchByEnter(text: string) {
    await this.typeInSearch(text);
    await this.getSearchInput().press("Enter");
  }

  async submitSearchByArrowButton(text: string) {
    await this.typeInSearch(text);
    // Arrow button appears only once input has a value; SVG path starts "M5 12h14"
    const arrowButton = this.page.locator("button").filter({
      has: this.page.locator("svg path[d*='M5 12h14']"),
    });
    await arrowButton.click();
  }

  // Two-phase wait for the 1800ms loading transition in doSearch():
  // 1. Assert loading screen appeared (confirms the action fired)
  // 2. Wait for it to disappear (the setTimeout resolves)
  async waitForLoadingToFinish() {
    await this.getLoadingText().waitFor({ state: "visible", timeout: 3000 });
    await this.getLoadingText().waitFor({ state: "hidden",  timeout: 5000 });
  }

  async waitForResultScreen() {
    await this.getVerificationResultLabel().waitFor({ state: "visible", timeout: 5000 });
  }
}

export default MobilePage;
