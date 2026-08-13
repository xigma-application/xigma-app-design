import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

test('draws a new text node on the canvas using the Text tool', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const before = await designPage.canvas.screenshot();

  const textTool = designPage.toolRadio('text');
  await expect(textTool).toBeVisible();

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.4;

  await designPage.drawTextBox(startX, startY, endX, endY);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  await designPage.typeText('Hello world');
  await designPage.click(box.x + box.width * 0.9, box.y + box.height * 0.9);

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('typing tool-shortcut letters while editing text does not switch the active tool', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-shortcut-block');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.4;

  await designPage.drawTextBox(startX, startY, endX, endY);

  // each of these letters is a tool shortcut (r=rectangle, f=frame, o=ellipse, l=line, t=text, ...)
  await designPage.typeText('rt frame line oval');

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');
});

test('wraps a long run of text with no spaces mid-word once it overflows a narrow box, matching the html overlay overflow-wrap: break-word', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-break-word');
  await expect(designPage.canvas).toBeVisible();

  const longRun = 'asdasdasdasdasdasdasdasdasdasdasdasdasd'; // one unbroken run, no spaces

  // a wide box: the run fits on a single line, unwrapped
  await designPage.drawTextBox(500, 100, 900, 140);
  await designPage.typeText(longRun);
  await designPage.click(950, 500);
  const unwrapped = await designPage.canvas.screenshot();

  // the same run in a narrow box must wrap mid-word onto several lines instead of overflowing it
  await designPage.drawTextBox(100, 100, 170, 400);
  await designPage.typeText(longRun);
  await designPage.click(950, 500);
  const wrapped = await designPage.canvas.screenshot();

  expect(wrapped.equals(unwrapped)).toBe(false);
});

test('discards the text node when no content is entered before clicking away', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  const box = await designPage.canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box unavailable');
  }

  const before = await designPage.canvas.screenshot();

  const startX = box.x + box.width * 0.3;
  const startY = box.y + box.height * 0.3;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.4;

  await designPage.drawTextBox(startX, startY, endX, endY);
  await designPage.click(box.x + box.width * 0.9, box.y + box.height * 0.9);

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(true);
});
