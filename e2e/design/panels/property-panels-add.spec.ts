import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const pickerPanel = (page: Page): ReturnType<Page['locator']> => page.locator('[class*="ColorPicker_"]:not([class*="ColorPicker__"])');

const effectPanel = (page: Page): ReturnType<Page['locator']> =>
  page.locator('[class*="EffectSettingsPanel_"]:not([class*="EffectSettingsPanel__"])');

const addEffect = async (page: Page, label: string): Promise<void> => {
  await page.getByLabel('Add effect').click();
  await page.getByText(label, { exact: true }).last().click();
};

const setup = async (page: Page, sessionName: string): Promise<void> => {
  const designPage = new DesignPage(page);

  await designPage.goto(sessionName);
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawRectangle(700, 200, 900, 360);
};

test.describe('Design panels — plus opens the panel of the new fill, stroke or effect', () => {
  test('adding a fill opens its picker, and adding another replaces it', async ({ page }) => {
    await setup(page, 'e2e-test-add-opens-fill-panel');

    // action
    await page.getByLabel('Add fill').click();

    // result
    await expect(pickerPanel(page)).toHaveCount(1);
    await expect(page.getByLabel('Hex color').nth(1)).toHaveAttribute('aria-expanded', 'true');

    // action
    await page.getByLabel('Add fill').click();

    // result
    await expect(pickerPanel(page)).toHaveCount(1);
    await expect(page.getByLabel('Hex color').nth(2)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByLabel('Hex color').nth(1)).not.toHaveAttribute('aria-expanded', 'true');
  });

  test('adding a stroke while a fill picker is open closes the fill picker and opens the stroke picker', async ({ page }) => {
    await setup(page, 'e2e-test-add-stroke-closes-fill-panel');

    // action
    await page.getByLabel('Hex color').first().click();

    // result
    await expect(page.getByLabel('Hex color').first()).toHaveAttribute('aria-expanded', 'true');

    // action
    await page.getByLabel('Add stroke').click();

    // result
    await expect(pickerPanel(page)).toHaveCount(1);
    await expect(page.getByLabel('Stroke color').first()).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByLabel('Hex color').first()).not.toHaveAttribute('aria-expanded', 'true');
  });

  test('choosing an effect opens its panel and it stays open, and other panels close in both directions', async ({ page }) => {
    await setup(page, 'e2e-test-add-effect-opens-panel');

    // action
    await page.getByLabel('Hex color').first().click();
    await addEffect(page, 'Inner shadow');

    // result — the fill picker is gone and the effect panel shows up and stays
    await expect(effectPanel(page)).toBeVisible();
    await page.waitForTimeout(400);
    await expect(effectPanel(page)).toBeVisible();
    await expect(pickerPanel(page)).toHaveCount(0);

    // action
    await page.getByLabel('Add fill').click();

    // result — the effect panel closes and the new fill picker opens
    await expect(effectPanel(page)).toHaveCount(0);
    await expect(pickerPanel(page)).toHaveCount(1);

    // action
    await addEffect(page, 'Drop shadow');

    // result
    await expect(pickerPanel(page)).toHaveCount(0);
    await expect(effectPanel(page)).toHaveCount(1);
    await expect(page.getByLabel('Change effect type')).toBeVisible();
  });
});
