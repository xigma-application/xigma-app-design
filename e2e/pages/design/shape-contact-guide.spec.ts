import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

test('a contact guide appears while a shape is dragged flush against another and clears on release', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-contact-guide-drag');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(800, 150, 1000, 300); // A
  await designPage.drawRectangle(800, 420, 950, 500); // B, 120px below A
  await designPage.selectTool('default');

  await designPage.pointerMove(1400, 800); // rest away
  const apart = await designPage.canvas.screenshot();

  await designPage.pointerDown(875, 460); // B centre
  await page.mouse.move(875, 340, { steps: 8 }); // drag B up 120px so its top edge meets A's bottom edge
  const dragging = await designPage.canvas.screenshot();

  expect(dragging.equals(apart)).toBe(false);

  await designPage.pointerUp();
  await designPage.pointerMove(1400, 800);
  const released = await designPage.canvas.screenshot();

  expect(released.equals(dragging)).toBe(false); // the guide is gone once the drag ends
});

test('Alt-hovering a selected shape that sits flush against another shows the contact guide', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-contact-guide-alt');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(800, 150, 1000, 300); // A
  await designPage.drawRectangle(800, 300, 950, 380); // B, already flush to A's bottom edge
  await designPage.selectTool('default');
  await designPage.click(875, 340); // select B

  await designPage.pointerMove(1400, 800);
  const selected = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1360, 800); // a move while Alt is held recomputes the guide
  const altHovered = await designPage.canvas.screenshot();
  await page.keyboard.up('Alt');

  expect(altHovered.equals(selected)).toBe(false);
});

test('Alt-hovering a selected shape shows a bridging connector when it aligns diagonally, with no overlap, with another shape', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-contact-guide-diagonal-alt');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 150, 900, 300); // A
  await designPage.drawRectangle(950, 300, 1050, 380); // B, top edge flush with A's bottom edge, no horizontal overlap
  await designPage.selectTool('default');
  await designPage.click(1000, 340); // select B

  await designPage.pointerMove(1400, 800);
  const selected = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1360, 800); // a move while Alt is held recomputes the guide
  const altHovered = await designPage.canvas.screenshot();
  await page.keyboard.up('Alt');

  expect(altHovered.equals(selected)).toBe(false);
});

test('Alt-hovering a selected shape shows a bridging connector when its top edge aligns with another shape sitting side by side', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-contact-guide-same-side-alt');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 150, 900, 350); // A
  await designPage.drawRectangle(950, 150, 1100, 280); // B, same top edge as A, no horizontal overlap
  await designPage.selectTool('default');
  await designPage.click(800, 200); // select A

  await designPage.pointerMove(1400, 800);
  const selected = await designPage.canvas.screenshot();

  await page.keyboard.down('Alt');
  await designPage.pointerMove(1360, 800); // a move while Alt is held recomputes the guide
  const altHovered = await designPage.canvas.screenshot();
  await page.keyboard.up('Alt');

  expect(altHovered.equals(selected)).toBe(false);
});
