import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('moving a selected layer to another page removes it from the current page’s Layers tree and adds it on the target page', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-move-to-page');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 100, 800, 200); // leaves the rectangle selected

  const layersTree = page.locator('[class*="LayersTree"]').first();
  const row = layersTree.locator('[class*="Tree__row_"]').first();

  await page.getByRole('button', { exact: true, name: 'Add new page' }).click(); // creates and switches to "Page 2"
  await page.getByText('Page 1', { exact: true }).click(); // back to the page holding the rectangle

  await expect(row).toHaveCount(1);

  await row.click(); // select the layer — right-click alone only opens the menu, it doesn't select
  await row.click({ button: 'right' }); // open the layer's context menu
  await page.getByText('Move to page').hover();
  await page.getByRole('menuitem', { name: 'Page 2' }).click();

  // result — the rectangle's row is gone from Page 1's Layers tree
  await expect(row).toHaveCount(0);

  // ...and switching to Page 2 shows it landed there
  await page.getByText('Page 2', { exact: true }).click();
  await expect(row).toHaveCount(1);
});
