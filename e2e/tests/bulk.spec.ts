import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import LoginPage from "../pages/LoginPage";
import * as dotenv from "dotenv";
dotenv.config();

test.describe('Bulk CSV Upload', () => {
  test('should process CSV and show results sequentially', async ({ page }) => {
    // Log in first
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.TEST_EMAIL || "",
      process.env.TEST_PASSWORD || ""
    );
    await expect(page).toHaveURL(/.*welcome.*/);

    // Mock API
    await page.route('**/api/check?query=481998C', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ trades: [{ licensee: 'Pristine Pipes', licenceNumber: '481998C', status: 'Current' }] }) });
    });
    await page.route('**/api/check?query=PLB-77432', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ trades: [{ licensee: 'Sandra Okafor', licenceNumber: 'PLB-77432', status: 'Active' }] }) });
    });

    // Navigate to Search
    await page.goto('/verifyTradie');
    
    // Check for Bulk CSV button
    const bulkButton = page.locator('text=BULK CSV UPLOAD');
    await expect(bulkButton).toBeVisible();

    // Upload CSV
    const filePath = path.join('/tmp', 'test_tradies_fix.csv');
    fs.writeFileSync(filePath, '481998C\nPLB-77432');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await bulkButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    // Verify progress
    await expect(page.locator('text=BULK CHECK IN PROGRESS')).toBeVisible();

    // Wait for completion (2s delay per item in code)
    await page.waitForTimeout(5000);
    await expect(page.locator('text=2 / 2 Verified')).toBeVisible();

    // Check results in table
    await expect(page.locator('tr:has-text("481998C")')).toBeVisible();
    await expect(page.locator('tr:has-text("PLB-77432")')).toBeVisible();
    
    // Verify 481998C is ACTIVE (not SUSPENDED)
    const row = page.locator('tr:has-text("481998C")');
    await expect(row.locator('text=ACTIVE')).toBeVisible();

    await expect(page.locator('text=EXPORT CSV')).toBeVisible();
  });
});
