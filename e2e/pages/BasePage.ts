import type { Page } from "@playwright/test";

export class BasePage {
  protected page: Page; // Define the type of 'page' as Page from Playwright or your specific testing framework

  constructor(page: Page) {
    // Common properties or methods for all pages can be defined here
    this.page = page; // Assuming 'page' is globally available in the test context
  }
}
