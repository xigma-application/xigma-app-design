import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('a selected frame and rectangle show the Mixed panel with only their common sections and header buttons', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-mixed-panel');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 200, 820, 320);
  await designPage.drawRectangle(900, 200, 1000, 300);
  await designPage.click(760, 260, { shift: true });

  await expect(page.locator('[data-test-component-header="mixed"]')).toBeVisible();
  await expect(page.locator('[data-test-section="fill"]')).toBeVisible();
  await expect(page.getByLabel('Create component', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Wrap in new section', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Boolean operations', { exact: true })).toHaveCount(0);
});

test('several selected frames show the html tag, component options, mask and wrap in section buttons in that order', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-multi-frame-header');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 200, 820, 320);
  await designPage.drawFrame(900, 200, 1020, 320);
  await designPage.click(760, 260, { shift: true });

  const header = page.locator('[data-test-component-header="frame"]');

  const labels = await header
    .locator('button[aria-label]')
    .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label')));

  expect(labels.slice(-5)).toEqual([
    'Toggle ready for dev status',
    'Create component',
    'Component options',
    'Use as mask',
    'Wrap in new section',
  ]);

  await header.getByLabel('Component options', { exact: true }).click();
  await expect(page.getByText('Create multiple components', { exact: true })).toBeVisible();
  await expect(page.getByText('Create component set', { exact: true })).toBeVisible();
});
