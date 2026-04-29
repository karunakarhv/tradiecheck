import { test, expect } from "@playwright/test";
import MobilePage from "../pages/MobilePage";
import { MobileLocators } from "../locators/MobileLocators";

test.describe("Mobile App Mockup", () => {
  let mobilePage: MobilePage;

  test.beforeEach(async ({ page }) => {
    mobilePage = new MobilePage(page);
    await mobilePage.visit();
    await expect(page).toHaveURL(/.*mobile.*/);
  });

  // ── HomeScreen rendering ─────────────────────────────────────────

  test("HomeScreen: renders search input", async () => {
    await expect(mobilePage.getSearchInput()).toBeVisible();
  });

  test("HomeScreen: renders Quick Try buttons (Active, Expiring, Suspended)", async () => {
    await expect(mobilePage.getQuickTryActiveButton()).toBeVisible();
    await expect(mobilePage.getQuickTryExpiringButton()).toBeVisible();
    await expect(mobilePage.getQuickTrySuspendedButton()).toBeVisible();
  });

  test("HomeScreen: renders Recent checks with Jake Morrison and Sandra Okafor", async () => {
    await expect(mobilePage.getJakeMorrisonRecentItem()).toBeVisible();
    await expect(mobilePage.getSandraOkaforRecentItem()).toBeVisible();
  });

  test("HomeScreen: renders Scan licence card panel", async () => {
    await expect(mobilePage.getScanLicenceCard()).toBeVisible();
    await expect(mobilePage.getOpenCameraButton()).toBeVisible();
  });

  test("HomeScreen: renders tab bar with all four tabs", async () => {
    await expect(mobilePage.getTabHome()).toBeVisible();
    await expect(mobilePage.getTabSearch()).toBeVisible();
    await expect(mobilePage.getTabSaved()).toBeVisible();
    await expect(mobilePage.getTabProfile()).toBeVisible();
  });

  // ── Outer layout ──────────────────────────────────────────────────

  test("outer layout: sidebar elements are present in the DOM", async ({ page }) => {
    // On narrow mobile viewports (390/393px) the sidebar overflows off-screen —
    // no @media query hides it, it just overflows. toBeAttached() verifies the
    // DOM structure without requiring viewport visibility.
    await expect(page.getByText(MobileLocators.tradieCheckMobileLabel)).toBeAttached();
    await expect(page.getByText(MobileLocators.appStoreButton, { exact: true })).toBeAttached();
    await expect(page.getByText(MobileLocators.googlePlayButton, { exact: true })).toBeAttached();
  });

  test("outer layout: ← Home link is visible", async () => {
    await expect(mobilePage.getHomeLinkAnchor()).toBeVisible();
  });

  // ── Active flow ───────────────────────────────────────────────────

  test("Active flow: Quick Try Active → Jake Morrison LICENCE ACTIVE & VERIFIED", async ({ page }) => {
    await mobilePage.getQuickTryActiveButton().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(page.getByText(MobileLocators.jakeMorrisonName)).toBeVisible();
    await expect(mobilePage.getLicenceActiveVerifiedBadge()).toBeVisible();
  });

  test("Active flow: all four checks show VERIFIED for Jake Morrison", async ({ page }) => {
    await mobilePage.getQuickTryActiveButton().click();
    await mobilePage.waitForLoadingToFinish();
    // Jake Morrison: status ACTIVE + highRiskWork + asbestosCleared + insuranceValid all true
    // exact:true avoids matching the "LICENCE ACTIVE & VERIFIED" badge text
    await expect(page.getByText(MobileLocators.checkVerified, { exact: true })).toHaveCount(4);
  });

  test("Active flow: no alerts shown for Jake Morrison", async ({ page }) => {
    await mobilePage.getQuickTryActiveButton().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(page.getByText(/🚨/)).not.toBeVisible();
    await expect(page.getByText(/⚠️/)).not.toBeVisible();
  });

  // ── Expiring flow ─────────────────────────────────────────────────

  test("Expiring flow: Quick Try Expiring → Sandra Okafor with expiry alert", async ({ page }) => {
    await mobilePage.getQuickTryExpiringButton().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(page.getByText(MobileLocators.sandraOkaforName)).toBeVisible();
    await expect(mobilePage.getLicenceActiveVerifiedBadge()).toBeVisible();
    await expect(page.getByText(/Licence expires soon/)).toBeVisible();
  });

  // ── Suspended flow ────────────────────────────────────────────────

  test("Suspended flow: Quick Try Suspended → Tony Ferraro LICENCE SUSPENDED", async ({ page }) => {
    await mobilePage.getQuickTrySuspendedButton().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(page.getByText(MobileLocators.tonyFerraroName)).toBeVisible();
    await expect(mobilePage.getLicenceSuspendedBadge()).toBeVisible();
  });

  test("Suspended flow: all three alert panels visible for Tony Ferraro", async ({ page }) => {
    await mobilePage.getQuickTrySuspendedButton().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(page.getByText(/Licence suspended/)).toBeVisible();
    await expect(page.getByText(/Insurance not verified/)).toBeVisible();
    await expect(page.getByText(/Asbestos cert missing/)).toBeVisible();
  });

  // ── Manual search ─────────────────────────────────────────────────

  test("manual search by Enter key: LIC-48291 → Jake Morrison result", async ({ page }) => {
    await mobilePage.submitSearchByEnter("LIC-48291");
    await mobilePage.waitForLoadingToFinish();
    await expect(page.getByText(MobileLocators.jakeMorrisonName)).toBeVisible();
  });

  test("manual search by arrow button click: LIC-48291 → Jake Morrison result", async ({ page }) => {
    await mobilePage.submitSearchByArrowButton("LIC-48291");
    await mobilePage.waitForLoadingToFinish();
    await expect(page.getByText(MobileLocators.jakeMorrisonName)).toBeVisible();
  });

  // ── Recent checks ─────────────────────────────────────────────────

  test("tapping Jake Morrison recent check navigates to result screen", async () => {
    await mobilePage.getJakeMorrisonRecentItem().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(mobilePage.getVerificationResultLabel()).toBeVisible();
  });

  test("tapping Sandra Okafor recent check navigates to result screen", async () => {
    await mobilePage.getSandraOkaforRecentItem().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(mobilePage.getVerificationResultLabel()).toBeVisible();
  });

  // ── ResultScreen content ──────────────────────────────────────────

  test("ResultScreen: 4-check grid labels are visible", async () => {
    await mobilePage.getQuickTryActiveButton().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(mobilePage.getCheckLicenceCell()).toBeVisible();
    await expect(mobilePage.getCheckHighRiskCell()).toBeVisible();
    await expect(mobilePage.getCheckAsbestosCell()).toBeVisible();
    await expect(mobilePage.getCheckInsuranceCell()).toBeVisible();
  });

  test("ResultScreen: licence detail row labels are visible", async () => {
    await mobilePage.getQuickTryActiveButton().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(mobilePage.getLicenceNumberLabel()).toBeVisible();
    await expect(mobilePage.getIssuingAuthorityLabel()).toBeVisible();
    await expect(mobilePage.getLicensedSinceLabel()).toBeVisible();
    await expect(mobilePage.getExpiryDateLabel()).toBeVisible();
  });

  test("ResultScreen: Google rating section is visible", async ({ page }) => {
    await mobilePage.getQuickTryActiveButton().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(page.getByText(/Google reviews/)).toBeVisible();
  });

  test("ResultScreen: Save Verification Report button is visible", async () => {
    await mobilePage.getQuickTryActiveButton().click();
    await mobilePage.waitForLoadingToFinish();
    await expect(mobilePage.getSaveVerificationReportButton()).toBeVisible();
  });

  // ── Back navigation ───────────────────────────────────────────────

  test("back button on ResultScreen returns to HomeScreen", async () => {
    await mobilePage.getQuickTryActiveButton().click();
    await mobilePage.waitForLoadingToFinish();
    await mobilePage.getBackButton().click();
    await expect(mobilePage.getSearchInput()).toBeVisible();
    await expect(mobilePage.getVerificationResultLabel()).not.toBeVisible();
  });

  // ── Home link navigation ──────────────────────────────────────────

  test("← Home link navigates to /welcome", async ({ page }) => {
    await mobilePage.getHomeLinkAnchor().click();
    await expect(page).toHaveURL(/.*welcome.*/);
  });
});
