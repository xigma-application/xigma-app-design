import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

test('panning with the hand tool moves the canvas content, and a frame remains selectable at its new screen position afterwards', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-hand-tool-pan');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140); // A, center at screen (720, 120)

  const dx = 150;
  const dy = 90;

  await page.keyboard.press('h');
  await designPage.pointerDown(1100, 500);
  await designPage.pointerMove(1100 + dx, 500 + dy);
  await designPage.pointerUp();

  // A rendered at screen (720, 120) before the pan now renders at (720 + dx, 120 + dy) — the world
  // position never changed, only the viewport offset did
  await page.keyboard.press('v');
  await designPage.click(720 + dx, 120 + dy);
  const selected = await designPage.canvas.screenshot();

  await designPage.click(610, 10); // empty canvas, well away from the panned frame — deselects
  const deselected = await designPage.canvas.screenshot();

  expect(selected.equals(deselected)).toBe(false);
});

test('dragging over a frame with the hand tool pans the canvas without selecting or moving the frame itself', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-hand-tool-no-select');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 100, 740, 140); // A, center at screen (720, 120)

  const dx = 100;
  const dy = 50;

  await page.keyboard.press('h');
  await designPage.pointerDown(720, 120); // press directly on top of A
  await designPage.pointerMove(720 + dx, 120 + dy);
  await designPage.pointerUp();

  const afterHandDrag = await designPage.canvas.screenshot();

  // if the hand-tool drag had instead selected/moved A (like the default tool would), a selection
  // outline would already be showing here — switching to the default tool and explicitly clicking
  // A at its new (panned) position produces a screenshot that DOES include a selection outline, so
  // the two must differ, proving the hand-tool drag left A unselected
  await page.keyboard.press('v');
  await designPage.click(720 + dx, 120 + dy);
  const withSelectionAtNewPosition = await designPage.canvas.screenshot();

  expect(afterHandDrag.equals(withSelectionAtNewPosition)).toBe(false);
});
