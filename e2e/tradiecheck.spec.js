import { test, expect } from '@playwright/test';

test.describe('TradieCheck homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads with search input and demo chips', async ({ page }) => {
    await expect(page.getByText('TradieCheck')).toBeVisible();
    await expect(page.getByPlaceholder('Name or licence number...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'CHECK' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Active Electrician' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Expiring Plumber' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Suspended Builder' })).toBeVisible();
  });

  test('navigation links are present', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Mobile' })).toHaveAttribute('href', '/mobile');
    await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    await expect(page.getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/help');
    // API nav link is feature-flagged (VITE_ENABLE_API_CONFIG) — hidden by default
    await expect(page.getByRole('link', { name: 'API' })).toHaveCount(0);
  });

  test('CHECK button is disabled with empty input', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'CHECK' })).toBeDisabled();
  });

  test('CHECK button enables when text is entered', async ({ page }) => {
    await page.getByPlaceholder('Name or licence number...').fill('LIC-48291');
    await expect(page.getByRole('button', { name: 'CHECK' })).toBeEnabled();
  });
});

test.describe('Mock data searches', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Active Electrician chip shows VERIFIED & ACTIVE result', async ({ page }) => {
    await page.getByRole('button', { name: 'Active Electrician' }).click();
    await expect(page.getByText('VERIFIED & ACTIVE')).toBeVisible();
    await expect(page.getByText('Jake Morrison')).toBeVisible();
    await expect(page.getByText('Licensed Electrician')).toBeVisible();
    await expect(page.getByText('LIC-48291')).toBeVisible();
  });

  test('Expiring Plumber chip shows ACTIVE result with alert', async ({ page }) => {
    await page.getByRole('button', { name: 'Expiring Plumber' }).click();
    await expect(page.getByText('VERIFIED & ACTIVE')).toBeVisible();
    await expect(page.getByText('Sandra Okafor')).toBeVisible();
    await expect(page.getByText('Plumber & Drainer')).toBeVisible();
    await expect(page.getByText(/Licence expires soon/)).toBeVisible();
  });

  test('Suspended Builder chip shows SUSPENDED result with alerts', async ({ page }) => {
    await page.getByRole('button', { name: 'Suspended Builder' }).click();
    await expect(page.getByText('SUSPENDED', { exact: true })).toBeVisible();
    await expect(page.getByText('Tony Ferraro')).toBeVisible();
    await expect(page.getByText('Builder — General')).toBeVisible();
    await expect(page.getByText(/Licence suspended/)).toBeVisible();
  });

  test('searching by typing and pressing Enter shows result', async ({ page }) => {
    await page.getByPlaceholder('Name or licence number...').fill('LIC-48291');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Jake Morrison')).toBeVisible();
  });

  test('searching via CHECK button shows result', async ({ page }) => {
    await page.getByPlaceholder('Name or licence number...').fill('BLD-10293');
    await page.getByRole('button', { name: 'CHECK' }).click();
    await expect(page.getByText('Tony Ferraro')).toBeVisible();
  });

  test('NEW SEARCH button resets to idle state', async ({ page }) => {
    await page.getByRole('button', { name: 'Active Electrician' }).click();
    await expect(page.getByText('Jake Morrison')).toBeVisible();
    await page.getByRole('button', { name: 'NEW SEARCH' }).click();
    await expect(page.getByText('Jake Morrison')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'CHECK' })).toBeVisible();
  });
});

test.describe('Not found state', () => {
  test('shows no results message when backend is unreachable', async ({ page }) => {
    // No backend running — fetch will fail → notFound state
    await page.goto('/');
    await page.getByPlaceholder('Name or licence number...').fill('UNKNOWN-99999');
    await page.getByRole('button', { name: 'CHECK' }).click();
    await expect(page.getByText('No results found')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'TRY AGAIN' })).toBeVisible();
  });

  test('TRY AGAIN button resets to idle state', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Name or licence number...').fill('UNKNOWN-99999');
    await page.getByRole('button', { name: 'CHECK' }).click();
    await expect(page.getByText('No results found')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'TRY AGAIN' }).click();
    await expect(page.getByText('No results found')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'CHECK' })).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('navigates to dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('navigates to mobile page', async ({ page }) => {
    await page.goto('/mobile');
    await expect(page).toHaveURL('/mobile');
  });

  test('navigates to api-config page', async ({ page }) => {
    await page.goto('/api-config');
    await expect(page).toHaveURL('/api-config');
  });
});
