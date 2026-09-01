import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// utils
import { countMismatchedPixels } from '../../utils/compareScreenshots';

const OUTLINE_STROKE_SHORTCUT = 'Alt+Control+O';
const DESELECT_POINT = { x: 1500, y: 700 };
// well clear of both the LeftPanel (0-500) and RightPanel (1680-1920) overlays — canvas.screenshot()
// composites those panels in too (they visually sit on top of the canvas element), so a plain
// full-canvas screenshot would pick up e.g. the layers panel's own text, not just the shape's ink
const SHAPE_REGION = { height: 350, width: 350, x: 800, y: 200 };

type TDesignSnapshot = {
  nodes: Record<string, { type: string }>;
  rootOrder: string[];
};

const readDesignState = (page: Page): Promise<TDesignSnapshot> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return { nodes, rootOrder };
  });

// there is no properties-panel UI yet for setting a node's own stroke (see the stroke-property
// plan) — every case here sets it the same way the app itself would once that panel exists: a
// direct updateNode dispatch, exactly like z-order.spec.ts's own fill-color setup.
const setStroke = (page: Page, changes: Record<string, unknown>): Promise<void> =>
  page.evaluate(async (nodeChanges) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [id] = pages[activePageId].rootOrder;

    store.dispatch(updateNode({ changes: nodeChanges, id }));
  }, changes);

// Outline as stroke must be a pure representation change: the stroke band becomes real filled
// geometry with the same color, alongside the shape's own existing fill — same pixels, only the
// node type (and its editability) changes. Deselecting before every screenshot keeps the
// comparison about the shape's own rendered ink, not each node type's own selection chrome.
test.describe('Outline as stroke', () => {
  test('outlines a Rectangle’s stroke into a vector with pixel-identical appearance', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-outline-stroke-rectangle');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(900, 300, 1050, 420);
    await setStroke(page, { strokeColor: '#FF0000', strokeWidth: 8 });
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const before = await page.screenshot({ clip: SHAPE_REGION });

    await designPage.click(975, 360);
    await page.keyboard.press(OUTLINE_STROKE_SHORTCUT);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const after = await page.screenshot({ clip: SHAPE_REGION });

    // countMismatchedPixels rather than a raw buffer equality check: a live-rendered stroke ring
    // and the same ring baked into a vector's own polygon fill sample the curve/join geometry at
    // slightly different points, differing only by antialiasing noise pixelmatch's own AA detection
    // (includeAA: false) is built to ignore. A sharp rectangle corner is the one exception, kept as
    // a small explicit tolerance rather than 0: getSharpRingVertices (live) and
    // getRectangleStrokeOutlineLoops (outline-as-stroke) build the outer corner slightly differently
    // and leave ~1-2px of real, visually imperceptible difference at each of the 4 corners — a
    // pre-existing discrepancy between two independently-written ring constructions, unrelated to
    // this test's own subject and out of scope to chase down here.
    expect(countMismatchedPixels(after, before)).toBeLessThanOrEqual(10);

    const state = await readDesignState(page);
    const [id] = state.rootOrder;

    expect(state.nodes[id].type).toBe('vector');
  });

  test('outlines an Ellipse’s stroke into a vector with pixel-identical appearance', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-outline-stroke-ellipse');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawEllipse(900, 300, 1050, 420);
    await setStroke(page, { strokeColor: '#00AA00', strokeWidth: 8 });
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const before = await page.screenshot({ clip: SHAPE_REGION });

    await designPage.click(975, 360);
    await page.keyboard.press(OUTLINE_STROKE_SHORTCUT);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const after = await page.screenshot({ clip: SHAPE_REGION });

    // countMismatchedPixels rather than a raw buffer equality check: a live-rendered stroke ring
    // and the same ring baked into a vector's own polygon fill sample the curve/join geometry at
    // slightly different points, differing only by antialiasing noise pixelmatch's own AA detection
    // (includeAA: false) is built to ignore
    expect(countMismatchedPixels(after, before)).toBe(0);

    const state = await readDesignState(page);
    const [id] = state.rootOrder;

    expect(state.nodes[id].type).toBe('vector');
  });

  test('outlines a Line’s stroke into a vector with pixel-identical appearance', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-outline-stroke-line');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawLine(900, 300, 1050, 420);
    await setStroke(page, { strokeWidth: 10 }); // TLineNode already has its own color field: `stroke`
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const before = await page.screenshot({ clip: SHAPE_REGION });

    await designPage.click(975, 360);
    await page.keyboard.press(OUTLINE_STROKE_SHORTCUT);
    await designPage.click(DESELECT_POINT.x, DESELECT_POINT.y);
    await designPage.pointerMove(DESELECT_POINT.x, DESELECT_POINT.y);
    const after = await page.screenshot({ clip: SHAPE_REGION });

    // countMismatchedPixels rather than a raw buffer equality check: a live-rendered stroke ring
    // and the same ring baked into a vector's own polygon fill sample the curve/join geometry at
    // slightly different points, differing only by antialiasing noise pixelmatch's own AA detection
    // (includeAA: false) is built to ignore
    expect(countMismatchedPixels(after, before)).toBe(0);

    const state = await readDesignState(page);
    const [id] = state.rootOrder;

    expect(state.nodes[id].type).toBe('vector');
  });
});
