import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('toggling rulers with Shift+R shows a matching hint bar above the toolbar that disappears on its own', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-toggle-rulers-hint');
  await expect(designPage.canvas).toBeVisible();

  await page.keyboard.press('Shift+R'); // rulers were hidden by default -> now shown

  await expect(page.getByText('Rulers shown')).toBeVisible();
  await expect(page.getByText('Rulers shown')).toBeHidden({ timeout: 4000 });

  await page.keyboard.press('Shift+R'); // now hides them again

  await expect(page.getByText('Rulers hidden')).toBeVisible();
});
