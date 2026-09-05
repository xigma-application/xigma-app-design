import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const FRAME = { x1: 600, x2: 1100, y1: 150, y2: 700 };

const flowGroup = (page: Page): Locator => page.locator('[data-test-toggle-button-group="flow"]');

const setFlow = async (page: Page, direction: 'Horizontal' | 'Vertical'): Promise<void> => {
  await flowGroup(page).getByLabel(direction, { exact: true }).click();
};

// drags whatever is under (from) to (to), pausing before release so the auto-layout drop indicator
// (computed live off the mousemove) has settled before the pointer is released — same helper as
// reorder.spec.ts
const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

type TNodeGeometry = { height: number; rotation: number; width: number; x: number; y: number };

const getFrameChildren = (page: Page): Promise<TNodeGeometry[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

    return frame.childIds.map((childId) => activePage.nodes[childId] as unknown as TNodeGeometry);
  });

const rotateNode = (page: Page, index: number, rotation: number): Promise<void> =>
  page.evaluate(
    async ({ index: nodeIndex, rotation: nodeRotation }) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const [frameId] = activePage.rootOrder;
      const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

      store.dispatch(updateNode({ changes: { rotation: nodeRotation }, id: frame.childIds[nodeIndex] }));
    },
    { index, rotation },
  );

test.describe('auto-layout — a rotated child', () => {
  test('is packed by its rotated bounding box, not its raw un-rotated one, so the next sibling doesn’t overlap it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-rotated-child');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Vertical');

    // a 60x60 square dragged into the (empty) frame — same fixture pattern as reorder.spec.ts —
    // settles at the frame's own top-left content-box origin
    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 630, y: 300 });

    const [square] = await getFrameChildren(page);

    // rotate it 45deg directly — an already-rotated element being inserted/updated inside an
    // auto-layout frame, not the interactive rotate-handle gesture (that's rotate.spec.ts's job)
    await rotateNode(page, 0, 45);

    // drag a second rectangle into the frame
    await designPage.drawRectangle(1400, 400, 1460, 460);
    await dragInto(page, { x: 1430, y: 430 }, { x: 630, y: 650 });

    const [rotatedSquare, second] = await getFrameChildren(page);

    expect(rotatedSquare.rotation).toBe(45);

    // a 60x60 box rotated 45deg has a rotated bounding box of side 60*sqrt(2) ≈ 84.85, starting
    // from the frame's own top edge (150) — the second child must clear that whole footprint
    // (≈234.85), not just the square's raw, un-rotated 60px height (which would land it at 210,
    // overlapping the rotated square's real on-screen footprint)
    const rawHeightBoundary = FRAME.y1 + square.height;
    const rotatedBoundingBoxBoundary = FRAME.y1 + square.height * Math.sqrt(2);

    expect(second.y).toBeGreaterThan(rawHeightBoundary + 10);
    expect(second.y).toBeCloseTo(rotatedBoundingBoxBoundary, 0);
  });
});
