import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const FRAME = { x1: 600, x2: 1100, y1: 150, y2: 700 };

const setFlowVertical = async (page: Page): Promise<void> => {
  await page.locator('[data-test-toggle-button-group="flow"]').getByLabel('Vertical', { exact: true }).click();
};

// same helper as reorder.spec.ts / gap-handles.spec.ts
const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const setIgnoreAutoLayout = (page: Page, childIndex: number): Promise<void> =>
  page.evaluate(async (index) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

    store.dispatch(updateNode({ changes: { ignoreAutoLayout: true }, id: frame.childIds[index] }));
  }, childIndex);

const readChild = (page: Page, childIndex: number): Promise<{ parentId: string | null; x: number; y: number }> =>
  page.evaluate(async (index) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };
    const child = activePage.nodes[frame.childIds[index]] as unknown as { parentId: string | null; x: number; y: number };

    return { parentId: child.parentId, x: child.x, y: child.y };
  }, childIndex);

const getChildId = (page: Page, childIndex: number): Promise<string> =>
  page.evaluate(async (index) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

    return frame.childIds[index];
  }, childIndex);

const readNodeById = (page: Page, id: string): Promise<{ ignoreAutoLayout?: boolean; parentId: string | null }> =>
  page.evaluate(async (nodeId) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const node = activePage.nodes[nodeId] as unknown as { ignoreAutoLayout?: boolean; parentId: string | null };

    return { ignoreAutoLayout: node.ignoreAutoLayout, parentId: node.parentId };
  }, id);

test.describe('auto-layout — a child that ignores auto layout', () => {
  test('stays completely static while its flow siblings are dragged and reordered around it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-ignore-auto-layout');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowVertical(page);

    // three children, dragged in from outside — same fixture pattern as reorder.spec.ts: Rectangle 1
    // at y150-210, Rectangle 2 at y210-270, Rectangle 3 at y270-330 (childIds order 0,1,2)
    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 630, y: 300 });

    // flag the third (bottom) child to ignore auto layout
    await setIgnoreAutoLayout(page, 2);

    const before = await readChild(page, 2);

    // drag the first (top) child down past the others, well inside the frame the whole time — a
    // real reorder gesture that would previously drag the flagged sibling's ghost along with it
    await dragInto(page, { x: 630, y: 180 }, { x: 630, y: 320 });

    const after = await readChild(page, 2);

    // the flagged child never moved and was never ejected from the frame
    expect(after).toEqual(before);
  });

  test('drags freely on the canvas instead of snapping into the reorder ghost', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-ignore-auto-layout-free-drag');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowVertical(page);

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 630, y: 300 });

    // flag the second (bottom) child to ignore auto layout
    await setIgnoreAutoLayout(page, 1);

    const before = await readChild(page, 1);

    // drag it 40px to the right and 15px down, staying well inside the frame — a plain reposition,
    // not a reorder; the two 60px-tall boxes stack from the frame's own top edge with no gap, so
    // the second one sits at y210-270 — grab it around its own midpoint
    await dragInto(page, { x: 630, y: 240 }, { x: 670, y: 255 });

    const after = await readChild(page, 1);

    // moved by exactly the drag delta, 1:1 — not snapped back into the flow, not ejected
    expect(after.parentId).toBe(before.parentId);
    expect(after.x - before.x).toBeCloseTo(40, 0);
    expect(after.y - before.y).toBeCloseTo(15, 0);
  });

  test('clears the flag once it is dragged out to a different parent', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-ignore-auto-layout-reparent');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlowVertical(page);

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 630, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 630, y: 300 });

    // flag the second (bottom) child to ignore auto layout
    await setIgnoreAutoLayout(page, 1);

    const childId = await getChildId(page, 1);
    const before = await readNodeById(page, childId);

    expect(before.ignoreAutoLayout).toBe(true);

    // drag it well outside the frame's own bounds, out to the root
    await dragInto(page, { x: 630, y: 240 }, { x: 1300, y: 750 });

    const after = await readNodeById(page, childId);

    // reparented to the root, and the flag is cleared — it's a normal node again in its new context
    expect(after.parentId).toBeNull();
    expect(after.ignoreAutoLayout).toBeUndefined();
  });
});
