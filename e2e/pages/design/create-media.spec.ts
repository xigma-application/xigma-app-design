import path from 'path';
import { test, expect } from '@playwright/test';

// pages
import { DesignPage } from './DesignPage';

// the fixtures are existing repo assets rather than new binary test files
const FIXTURE_PATH = path.join(import.meta.dirname, '../../../src/assets/icons/cursors/default.png');
const FIXTURE_NATURAL_WIDTH = 16;
const FIXTURE_NATURAL_HEIGHT = 19;
const SECOND_FIXTURE_PATH = path.join(import.meta.dirname, '../../../src/assets/icons/cursors/pointer.png');

// native file-chooser interception is flaky when several browser instances trigger it at once,
// so this file's tests must not run concurrently with each other
test.describe.configure({ mode: 'serial' });

test('places the image at its exact natural pixel size on a plain click', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile(FIXTURE_PATH);

  const mediaTool = designPage.toolRadio('media');
  await expect(mediaTool).toHaveAttribute('aria-checked', 'true');

  await designPage.placeMediaAtNaturalSize(100, 100);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  const clickPlacement = await designPage.canvas.screenshot();

  // reload and drag out the exact same file to its known natural size, top-left anchored at the same point
  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();
  await designPage.pickMediaFile(FIXTURE_PATH);
  await designPage.dragMedia(100, 100, 100 + FIXTURE_NATURAL_WIDTH, 100 + FIXTURE_NATURAL_HEIGHT);

  const exactSizeDragPlacement = await designPage.canvas.screenshot();

  // a plain click (no drag) must produce the identical result as explicitly dragging to the natural size
  expect(clickPlacement.equals(exactSizeDragPlacement)).toBe(true);
});

test('locks the placed size to the source image aspect ratio, regardless of the raw drag ratio', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile(FIXTURE_PATH);
  // drag a short, wide box (100x10) that does not match the source's 16:19 ratio at all
  await designPage.dragMedia(100, 100, 200, 110);

  const shortWideDragPlacement = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile(FIXTURE_PATH);
  // drag a box already sized to the locked outcome of the drag above (100 wide -> height = 100 * 19/16)
  await designPage.dragMedia(100, 100, 200, 100 + (100 * FIXTURE_NATURAL_HEIGHT) / FIXTURE_NATURAL_WIDTH);

  const preLockedSizeDragPlacement = await designPage.canvas.screenshot();

  // both drags share the same raw width but wildly different raw heights — if the ratio is
  // correctly locked, both must resolve to the exact same final rect
  expect(shortWideDragPlacement.equals(preLockedSizeDragPlacement)).toBe(true);
});

test('places multiple picked files one after another, staying on the tool until the last one is placed', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile([FIXTURE_PATH, SECOND_FIXTURE_PATH]);

  const mediaTool = designPage.toolRadio('media');
  await expect(mediaTool).toHaveAttribute('aria-checked', 'true');

  const beforeFirst = await designPage.canvas.screenshot();

  // place the first file with a plain click
  await designPage.placeMediaAtNaturalSize(100, 100);

  // still armed for the second file — the tool must stay active, not revert to default
  await expect(mediaTool).toHaveAttribute('aria-checked', 'true');

  const afterFirst = await designPage.canvas.screenshot();
  expect(afterFirst.equals(beforeFirst)).toBe(false);

  // place the second file with a drag
  await designPage.dragMedia(300, 100, 360, 160);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  const afterSecond = await designPage.canvas.screenshot();
  expect(afterSecond.equals(afterFirst)).toBe(false);
});

test('opens the file picker via the Ctrl/Cmd+Shift+K shortcut', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  // CONTROL_PRIMARY_KEY resolves per-OS at runtime (constant/mainKeys.ts), so match it here too
  const isMac = await page.evaluate(() => /Mac/i.test(navigator.userAgent));
  const shortcut = isMac ? 'Meta+Shift+K' : 'Control+Shift+K';

  // a single keypress occasionally gets lost under heavy parallel load (many browser instances
  // competing for CPU), so retry once with a short first attempt before falling back to the
  // full default timeout
  let fileChooser;

  try {
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 });

    await page.keyboard.press(shortcut);
    fileChooser = await fileChooserPromise;
  } catch {
    const fileChooserPromise = page.waitForEvent('filechooser');

    await page.keyboard.press(shortcut);
    fileChooser = await fileChooserPromise;
  }

  await fileChooser.setFiles(FIXTURE_PATH);

  const mediaTool = designPage.toolRadio('media');
  await expect(mediaTool).toHaveAttribute('aria-checked', 'true');
});
