import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// utils
import { countMismatchedPixels } from '../../utils/compareScreenshots';

const FLATTEN_SHORTCUT = 'Alt+Shift+F';
const DESELECT_POINT = { x: 1500, y: 700 };
// well clear of both the LeftPanel (0-500) and RightPanel (1680-1920) overlays — canvas.screenshot()
// composites those panels in too (they visually sit on top of the canvas element), so a plain
// full-canvas screenshot would pick up e.g. the layers panel's own text, not just the shape's ink
const SHAPE_REGION = { height: 350, width: 350, x: 800, y: 200 };

type TDesignSnapshot = {
  nodes: Record<
    string,
    {
      filledFaceKeys?: string[];
      segments?: Record<string, unknown>;
      type: string;
    }
  >;
  rootOrder: string[];
};

const readDesignState = (page: Page): Promise<TDesignSnapshot> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return { nodes, rootOrder };
  });

// Flatten must be a pure representation change: same fill, same outline, same pixels — only the
// underlying node type (and its editable geometry) changes. Deselecting before every screenshot
// keeps the comparison about the shape's own rendered ink, not each node type's own selection chrome
// (e.g. a rectangle's corner-radius handle vs a plain vector's vertex dots).
test.describe('Flatten — shapes', () => {
  test('flattens a Rectangle into a vector with pixel-identical appearance', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-flatten-rectangle');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(900, 300, 1050, 420);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const before = await page.screenshot({ clip: SHAPE_REGION });

    await designPage.click(975, 360); // reselect the rectangle
    await page.keyboard.press(FLATTEN_SHORTCUT);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const after = await page.screenshot({ clip: SHAPE_REGION });

    // countMismatchedPixels rather than a raw buffer equality check: a curve (Ellipse) rendered via
    // its own native routine vs. flattened into a vector's polygon fill samples the curve at
    // slightly different points, differing only by antialiasing noise pixelmatch's own AA detection
    // (includeAA: false) is built to ignore
    expect(countMismatchedPixels(after, before)).toBe(0);

    const state = await readDesignState(page);
    const [id] = state.rootOrder;

    expect(state.nodes[id].type).toBe('vector');
  });

  test('flattens an Ellipse into a vector with pixel-identical appearance', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-flatten-ellipse');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawEllipse(900, 300, 1050, 420);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const before = await page.screenshot({ clip: SHAPE_REGION });

    await designPage.click(975, 360);
    await page.keyboard.press(FLATTEN_SHORTCUT);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const after = await page.screenshot({ clip: SHAPE_REGION });

    // countMismatchedPixels rather than a raw buffer equality check: a curve (Ellipse) rendered via
    // its own native routine vs. flattened into a vector's polygon fill samples the curve at
    // slightly different points, differing only by antialiasing noise pixelmatch's own AA detection
    // (includeAA: false) is built to ignore
    expect(countMismatchedPixels(after, before)).toBe(0);

    const state = await readDesignState(page);
    const [id] = state.rootOrder;

    expect(state.nodes[id].type).toBe('vector');
  });

  test('flattens a Line into a vector with pixel-identical appearance', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-flatten-line');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawLine(900, 300, 1050, 420);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const before = await page.screenshot({ clip: SHAPE_REGION });

    await designPage.click(975, 360); // midpoint of the line's own body
    await page.keyboard.press(FLATTEN_SHORTCUT);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const after = await page.screenshot({ clip: SHAPE_REGION });

    // countMismatchedPixels rather than a raw buffer equality check: a curve (Ellipse) rendered via
    // its own native routine vs. flattened into a vector's polygon fill samples the curve at
    // slightly different points, differing only by antialiasing noise pixelmatch's own AA detection
    // (includeAA: false) is built to ignore
    expect(countMismatchedPixels(after, before)).toBe(0);

    const state = await readDesignState(page);
    const [id] = state.rootOrder;

    expect(state.nodes[id].type).toBe('vector');
  });

  test('flattens a Polygon into a vector with pixel-identical appearance', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-flatten-polygon');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawPolygon(900, 300, 1050, 420);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const before = await page.screenshot({ clip: SHAPE_REGION });

    await designPage.click(975, 360);
    await page.keyboard.press(FLATTEN_SHORTCUT);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const after = await page.screenshot({ clip: SHAPE_REGION });

    // countMismatchedPixels rather than a raw buffer equality check: a curve (Ellipse) rendered via
    // its own native routine vs. flattened into a vector's polygon fill samples the curve at
    // slightly different points, differing only by antialiasing noise pixelmatch's own AA detection
    // (includeAA: false) is built to ignore
    expect(countMismatchedPixels(after, before)).toBe(0);

    const state = await readDesignState(page);
    const [id] = state.rootOrder;

    expect(state.nodes[id].type).toBe('vector');
  });

  test('flattens a Star into a vector with pixel-identical appearance', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-flatten-star');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawStar(900, 300, 1050, 420);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const before = await page.screenshot({ clip: SHAPE_REGION });

    await designPage.click(975, 360);
    await page.keyboard.press(FLATTEN_SHORTCUT);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const after = await page.screenshot({ clip: SHAPE_REGION });

    // countMismatchedPixels rather than a raw buffer equality check: a curve (Ellipse) rendered via
    // its own native routine vs. flattened into a vector's polygon fill samples the curve at
    // slightly different points, differing only by antialiasing noise pixelmatch's own AA detection
    // (includeAA: false) is built to ignore
    expect(countMismatchedPixels(after, before)).toBe(0);

    const state = await readDesignState(page);
    const [id] = state.rootOrder;

    expect(state.nodes[id].type).toBe('vector');
  });
});

test.describe('Flatten — text', () => {
  // covers the whole letter set this session's face-derivation/hole-detection/cusp-collapse fixes
  // touched (self-crossing e/n/x, multi-contour D/A/K/Q, Polish diacritics, and the "(" ")" cusp
  // regression) in one real, end-to-end pass through the running app instead of only unit tests
  const FULL_ALPHABET_WITH_SPECIAL_CHARS =
    'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ 0123456789 (){}[]!?.,;:';

  test('flattens Text (full alphabet + Polish diacritics + punctuation) into one valid vector', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-flatten-text-full-alphabet');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawTextBox(600, 200, 1600, 500);
    await designPage.typeText(FULL_ALPHABET_WITH_SPECIAL_CHARS);
    await page.keyboard.press('Escape'); // commits, stays selected

    await page.keyboard.press(FLATTEN_SHORTCUT);

    const state = await readDesignState(page);
    const [id] = state.rootOrder;
    const node = state.nodes[id];

    expect(node.type).toBe('vector');
    expect(Object.keys(node.segments ?? {}).length).toBeGreaterThan(0);
    expect(node.filledFaceKeys?.length ?? 0).toBeGreaterThan(0);

    // every filled face key must still resolve to real geometry — a face silently lost during
    // flatten (this session's core bug) would leave a dangling key with no matching segments
    const segmentIds = new Set(Object.keys(node.segments ?? {}));

    node.filledFaceKeys?.forEach((key) => {
      const realSegmentIds = key.split(',').map((piece) => piece.split('[')[0]);

      realSegmentIds.forEach((segmentId) => expect(segmentIds.has(segmentId)).toBe(true));
    });
  });

  // matches Figma: flattening text-on-path bakes the glyphs into real, independent vector geometry
  // and gets rid of the path it was bound to — nothing is left still relying on it afterwards
  test('flattens text-on-path into a real vector and deletes the now-orphaned path node', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-flatten-text-on-path');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawTextOnPath(900, 300, 1050, 420);
    await designPage.typeText('Hi');
    await page.keyboard.press('Escape'); // commits, stays selected

    const before = await readDesignState(page);

    expect(before.rootOrder).toHaveLength(2); // the path node and the text node bound to it

    await page.keyboard.press(FLATTEN_SHORTCUT);

    const after = await readDesignState(page);

    // only the flattened text remains — its own path is gone from rootOrder entirely
    expect(after.rootOrder).toHaveLength(1);
    expect(after.rootOrder).toEqual(before.rootOrder.filter((id) => id !== before.rootOrder[0]));

    const node = after.nodes[after.rootOrder[0]];

    expect(node.type).toBe('vector');
    expect(Object.keys(node.segments ?? {}).length).toBeGreaterThan(0);
    expect(node.filledFaceKeys?.length ?? 0).toBeGreaterThan(0);
  });
});
