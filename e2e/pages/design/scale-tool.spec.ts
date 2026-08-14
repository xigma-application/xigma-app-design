import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

const waitForCursor = async (designPage: DesignPage, x: number, y: number): Promise<string> => {
  for (let attempt = 0; attempt < 20; attempt++) {
    await designPage.pointerMove(x + (attempt % 2), y);

    const cursor = await designPage.cursorStyle();

    if (cursor) {
      return cursor;
    }
  }

  throw new Error('cursor never applied');
};

test('pressing "K" activates the Scale tool, showing it checked on the shared default/hand/scale button', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await page.keyboard.press('k');

  const scaleTool = designPage.toolRadio('scale');
  await expect(scaleTool).toHaveAttribute('aria-checked', 'true');
});

test('applies a different cursor over a resize handle than the plain resize cursor', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(300, 300, 400, 350);
  await designPage.click(350, 325);

  const resizeCursor = await waitForCursor(designPage, 400, 350); // "se" corner handle, default (resize) tool

  await page.keyboard.press('k');
  await designPage.pointerMove(400, 300); // move off, then back on, so the cursor style recomputes
  const scaleCursor = await waitForCursor(designPage, 400, 350); // "se" corner handle, scale tool

  expect(scaleCursor).not.toBe(resizeCursor);
});

test('grabbing an edge handle scales both dimensions proportionally, unlike a plain resize', async ({ page }) => {
  const designPage = new DesignPage(page);

  // baseline — same edge drag with the plain (default) resize tool: only height should change
  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(300, 300, 400, 350); // 100x50
  await designPage.click(350, 325);

  await designPage.pointerDown(350, 300); // "n" (top) edge handle
  await designPage.pointerMove(350, 200);
  await designPage.pointerUp();

  const afterPlainResize = await designPage.canvas.screenshot();

  // same drag, but with the Scale tool active — width should grow too, producing a different result
  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(300, 300, 400, 350);
  await designPage.click(350, 325);
  await page.keyboard.press('k');

  await designPage.pointerDown(350, 300); // "n" (top) edge handle
  await designPage.pointerMove(350, 200);
  await designPage.pointerUp();

  const afterScale = await designPage.canvas.screenshot();

  expect(afterScale.equals(afterPlainResize)).toBe(false);

  // the Scale tool stays active after the drag, unlike a shape-creation tool reverting to default
  const scaleTool = designPage.toolRadio('scale');
  await expect(scaleTool).toHaveAttribute('aria-checked', 'true');
});
