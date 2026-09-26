import path from 'path';
import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

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

test('Place all places every picked file at once and reverts to the default tool', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project-place-all');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile([FIXTURE_PATH, SECOND_FIXTURE_PATH]);

  const before = await designPage.canvas.screenshot();

  await expect(page.getByText('Click or drag to place')).toBeVisible();
  await designPage.placeAllMedia();

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('picking the same file twice places two layers that share one image source', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile(FIXTURE_PATH);
  await designPage.placeMediaAtNaturalSize(700, 100);
  await designPage.pickMediaFile(FIXTURE_PATH);
  await designPage.placeMediaAtNaturalSize(900, 100);

  const sources = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return rootOrder.slice(-2).map((id) => JSON.stringify(nodes[id]).match(/blob:[^"]+/)?.[0]);
  });

  expect(sources[0]).toBeTruthy();
  expect(sources[1]).toBe(sources[0]);
});

test('placing an image adds a rectangle with an image fill and shows the Image panel header', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project-media-image-panel');
  await expect(designPage.canvas).toBeVisible();

  // action
  await designPage.pickMediaFile(FIXTURE_PATH);
  await designPage.placeMediaAtNaturalSize(700, 100);

  // result — the placed layer is a rectangle filled only with the picked image
  const node = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return nodes[rootOrder[rootOrder.length - 1]];
  });

  expect(node).toMatchObject({ fills: [{ opacity: 100, scaleMode: 'fill', type: 'image' }], name: 'Image', type: 'rectangle' });

  // result — the rectangle panel is shown with the Image header, its Appearance section and the image fill row
  const header = page.locator('[data-test-component-header="rectangle"]');

  await expect(header.getByText('Image', { exact: true })).toBeVisible();
  await expect(header.getByLabel('Edit object')).toBeVisible();
  await expect(page.getByText('Corner radius')).toBeVisible();
  await expect(page.locator('[data-test-section="fill"]').getByRole('textbox')).toHaveValue('Image');
});

test('selecting an image and a video together shows the selected count in the panel header', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project-media-mixed-header');
  await expect(designPage.canvas).toBeVisible();

  await designPage.pickMediaFile([FIXTURE_PATH, SECOND_FIXTURE_PATH]);
  await designPage.placeAllMedia();

  // action — turn the second placed layer's fill into a video and select both layers
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection, updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const [imageId, videoId] = rootOrder.slice(-2);
    const imageFill = (nodes[videoId] as { fills: object[] }).fills[0];

    store.dispatch(updateNode({ changes: { fills: [{ ...imageFill, type: 'video' }] }, id: videoId }));
    store.dispatch(setSelection([imageId, videoId]));
  });

  // result
  await expect(page.locator('[data-test-component-header="rectangle"]').getByText('2 selected', { exact: true })).toBeVisible();
});

test('selecting several images shows only Remove background and Boost resolution, and an image with a video shows no image toolbar', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-project-media-multi-toolbar');
  await expect(designPage.canvas).toBeVisible();

  // action — Place all leaves both placed images selected
  await designPage.pickMediaFile([FIXTURE_PATH, SECOND_FIXTURE_PATH]);
  await designPage.placeAllMedia();

  // result
  await expect(page.getByRole('button', { name: 'Remove background' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Boost resolution' })).toBeVisible();
  await expect(page.getByText('Boost resolution', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Crop' })).toHaveCount(0);

  // action — turn the second image into a video
  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const videoId = rootOrder[rootOrder.length - 1];
    const imageFill = (nodes[videoId] as { fills: object[] }).fills[0];

    store.dispatch(updateNode({ changes: { fills: [{ ...imageFill, type: 'video' }] }, id: videoId }));
  });

  // result
  await expect(page.getByRole('button', { name: 'Remove background' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Boost resolution' })).toHaveCount(0);
});
