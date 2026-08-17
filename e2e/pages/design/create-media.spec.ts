import path from 'path';
import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

// the fixtures are existing repo assets rather than new binary test files
const FIXTURE_PATH = path.join(import.meta.dirname, '../../../src/assets/icons/cursors/default.png');
const SECOND_FIXTURE_PATH = path.join(import.meta.dirname, '../../../src/assets/icons/cursors/pointer.png');

// native file-chooser interception is flaky when several browser instances trigger it at once,
// so this file's tests must not run concurrently with each other
test.describe.configure({ mode: 'serial' });

test('places multiple picked files one after another, staying on the tool until the last one is placed', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile([FIXTURE_PATH, SECOND_FIXTURE_PATH]);

  const mediaTool = designPage.toolRadio('media');
  await expect(mediaTool).toHaveAttribute('aria-checked', 'true');

  const beforeFirst = await designPage.canvas.screenshot();

  // place the first file with a plain click
  await designPage.placeMediaAtNaturalSize(700, 100);

  // still armed for the second file — the tool must stay active, not revert to default
  await expect(mediaTool).toHaveAttribute('aria-checked', 'true');

  const afterFirst = await designPage.canvas.screenshot();
  expect(afterFirst.equals(beforeFirst)).toBe(false);

  // place the second file with a drag
  await designPage.dragMedia(900, 100, 960, 160);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  const afterSecond = await designPage.canvas.screenshot();
  expect(afterSecond.equals(afterFirst)).toBe(false);
});

test('selects every placed file together, so a multi-file pick ends with all of them selected', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile([FIXTURE_PATH, SECOND_FIXTURE_PATH]);

  // place both files with a plain click (natural size), which always centers on the click point
  // regardless of each fixture's own actual natural size (`getCenteredMediaRect.spec.ts` covers
  // the exact centering math) — so clicking at (or near) the same point later is guaranteed to
  // land on that image, without needing to know either fixture's real dimensions or replicate the
  // aspect-locked-drag math for a second file
  await designPage.placeMediaAtNaturalSize(700, 100);
  // the next queued file still has to round-trip through its own Image() decode before
  // armNextFile arms it (same reason pickMediaFile waits after the initial pick) — clicking again
  // too soon lands on a still-unarmed tool and silently does nothing. Several browser instances
  // decoding images at once under a full parallel test run slows this down further (same class of
  // flakiness this file's own serial-mode comment already flags), so this needs more margin than
  // pickMediaFile's own 200ms
  await page.waitForTimeout(500);
  await designPage.placeMediaAtNaturalSize(900, 100);

  // rest the pointer somewhere neutral first — otherwise the hover outline (independent of
  // selection, see the "Gotcha for other e2e tests" note in TEST_CASES.md) would depend on wherever
  // the previous gesture happened to leave the pointer, and could differ between this screenshot and
  // the manually-reconstructed reference below for a reason unrelated to selection
  await designPage.pointerMove(1500, 400);
  const afterBothPlaced = await designPage.canvas.screenshot();

  // deselect everything, then manually shift-click both images through the ordinary selection
  // tool to build a known-correct multi-selection — 2+ selected nodes sharing a parent render one
  // shared group outline (see selection.spec.ts's shift-click test), so this reference render can
  // only match the placement result above if both files genuinely ended up selected together,
  // not just the most recently placed one
  await designPage.click(1500, 600);
  await designPage.click(702, 102);
  await designPage.click(902, 102, { shift: true });
  await designPage.pointerMove(1500, 400); // same neutral point, so hover state matches

  const manuallyMultiSelected = await designPage.canvas.screenshot();

  expect(afterBothPlaced.equals(manuallyMultiSelected)).toBe(true);
});
