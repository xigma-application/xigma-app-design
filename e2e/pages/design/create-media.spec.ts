import path from 'path';
import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './model/DesignPage';

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
