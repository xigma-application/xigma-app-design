import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('zooming in with the keyboard shortcut changes the rendered canvas content', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-zoom-in');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 760, 360);

  const before = await designPage.canvas.screenshot();

  await page.keyboard.press('Control+Equal');

  const after = await designPage.canvas.screenshot();

  expect(before.equals(after)).toBe(false);
});

test('zoom to fit is selection-aware: it fits the selection when one exists, and fits everything once the selection is cleared', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-zoom-to-fit-selection-aware');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140); // A
  await designPage.drawFrame(900, 500, 940, 540); // B, far from A

  await page.keyboard.press('v');
  await designPage.click(720, 120); // select A only

  await page.keyboard.press('Shift+1'); // zoom to fit -> fits only A (the selection)
  const fitSelection = await designPage.canvas.screenshot();

  await page.keyboard.press('Escape'); // clears the selection
  await page.keyboard.press('Shift+1'); // zoom to fit -> fits both A and B now
  const fitAll = await designPage.canvas.screenshot();

  expect(fitSelection.equals(fitAll)).toBe(false);
});

test('zoom to fit shows a hint bar above the toolbar that disappears on its own', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-zoom-to-fit-hint');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 300, 760, 360);
  await page.keyboard.press('Shift+1');

  await expect(page.getByText('Zoomed to fit')).toBeVisible();
  await expect(page.getByText('Zoomed to fit')).toBeHidden({ timeout: 4000 });
});
