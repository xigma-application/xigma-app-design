import { test, expect } from '@playwright/test';

test('app loads in the browser', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#root')).toBeVisible();
});
