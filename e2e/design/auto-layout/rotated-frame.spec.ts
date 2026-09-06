import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const ROW_FRAME = { x1: 600, x2: 840, y1: 150, y2: 250 };

const flowGroup = (page: Page): Locator => page.locator('[data-test-toggle-button-group="flow"]');

const setFlowHorizontal = async (page: Page): Promise<void> => {
  await flowGroup(page).getByLabel('Horizontal', { exact: true }).click();
};

const setHorizontalGap = async (page: Page, gap: number): Promise<void> => {
  const gapInput = page.locator('[data-test-text-field-input="gap"]').first();

  await gapInput.click();
  await gapInput.fill(String(gap));
  await gapInput.press('Enter');
};

// same helper as reorder.spec.ts / rotated-child.spec.ts
const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

type TNodeGeometry = { height: number; id: string; rotation: number; width: number; x: number; y: number };

const getFrameChildren = (page: Page): Promise<TNodeGeometry[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const frame = activePage.nodes[frameId] as unknown as { childIds: string[] };

    return frame.childIds.map((childId) => activePage.nodes[childId] as unknown as TNodeGeometry);
  });

const rotateFrame = (page: Page, rotation: number): Promise<void> =>
  page.evaluate(async (nodeRotation) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [frameId] = pages[activePageId].rootOrder;

    store.dispatch(updateNode({ changes: { rotation: nodeRotation }, id: frameId }));
  }, rotation);

// the same rigid-rotate the interactive rotate-handle and the RightPanel's rotation field both use —
// rotates the frame AND every descendant leaf around the frame's own centre, each also gaining the
// same rotation delta as its own
const rotateFrameRigidly = (page: Page, rotation: number): Promise<void> =>
  page.evaluate(async (nodeRotation) => {
    const { store } = await import('/src/store/index.ts');
    const { rotateNodesRigidly } =
      await import('/src/components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueRotateDrag/rotateNodesRigidly.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;

    rotateNodesRigidly(store.dispatch, activePage.nodes[frameId], nodeRotation);
  }, rotation);

test.describe('auto-layout — a rotated frame', () => {
  test('keeps its children anchored to (and orbiting) its own centre, instead of resetting them to the flat, un-rotated flow position', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    // a 240x100 frame, no gap, two 60x60 children in one horizontal row: cells at world x 600 / 660
    await designPage.goto('e2e-test-auto-layout-rotated-frame');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(ROW_FRAME.x1, ROW_FRAME.y1, ROW_FRAME.x2, ROW_FRAME.y2);
    await setFlowHorizontal(page);
    await setHorizontalGap(page, 0);

    for (let index = 0; index < 2; index += 1) {
      await designPage.drawRectangle(1400, 160, 1460, 220);
      await dragInto(page, { x: 1430, y: 190 }, { x: ROW_FRAME.x2 - 15, y: 200 });
    }

    const before = await getFrameChildren(page);

    expect(before).toEqual([
      expect.objectContaining({ height: 60, width: 60, x: 600, y: 150 }),
      expect.objectContaining({ height: 60, width: 60, x: 660, y: 150 }),
    ]);

    // regression: before the fix, syncAutoLayoutChildren (which reruns on every updateNode, including
    // just a rotation change) always re-packed children along the world axes, ignoring frame.rotation
    // entirely — so rotating the frame reset them straight back to this same flat row instead of
    // carrying them around with it
    await rotateFrame(page, 90);

    const after = await getFrameChildren(page);

    // the row's own two slot centres — (630,180) and (690,180) — orbit the frame's centre (720,200)
    // by 90deg to (740,110) and (740,170): the row turns into a column, anchored to one shared pivot
    expect(after[0]).toMatchObject({ x: 710, y: 80 });
    expect(after[1]).toMatchObject({ x: 710, y: 140 });
  });

  test('keeps siblings evenly spaced, not pushed apart, when the rotate-handle rigidly tilts every child along with the frame', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    // a 240x100 frame, no gap, three 60x40 (non-square) children in one horizontal row
    const rowFrame = { x1: 600, x2: 840, y1: 150, y2: 250 };

    await designPage.goto('e2e-test-auto-layout-rotated-frame-rigid');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(rowFrame.x1, rowFrame.y1, rowFrame.x2, rowFrame.y2);
    await setFlowHorizontal(page);
    await setHorizontalGap(page, 0);

    for (let index = 0; index < 3; index += 1) {
      await designPage.drawRectangle(1400, 160, 1460, 200);
      await dragInto(page, { x: 1430, y: 180 }, { x: rowFrame.x2 - 15, y: 200 });
    }

    const before = await getFrameChildren(page);

    expect(before).toHaveLength(3);

    // regression: continueRotateDrag (the interactive rotate-handle) also rigidly rotates every
    // descendant leaf by the same delta as the frame — so each child ends up with its own rotation
    // matching the frame's. Before the fix, syncAutoLayoutChildren packed by each child's absolute
    // (world-axis) rotated bounding box, which is bigger than its raw 60x40 footprint once a child
    // is tilted — inflating the flow spacing and pushing later children progressively farther apart
    await rotateFrameRigidly(page, 45);

    const after = await getFrameChildren(page);

    // a rigid rotation preserves distances: consecutive children's own centres must stay close to
    // 60 apart (their un-inflated width, no gap) — the same as before the frame ever rotated, give
    // or take the per-dispatch Math.round rounding this multi-node commit compounds across four
    // separate updateNode dispatches (frame + 3 children) each re-syncing all three siblings. Before
    // the fix, packing by each child's *absolute* (already-45deg-tilted) bounding box inflated a
    // 60x40 footprint to roughly 70.7 either way — an order of magnitude past that rounding slack
    const centreOf = (node: TNodeGeometry): { x: number; y: number } => ({ x: node.x + node.width / 2, y: node.y + node.height / 2 });
    const distance = (p: { x: number; y: number }, q: { x: number; y: number }): number => Math.hypot(p.x - q.x, p.y - q.y);

    expect(Math.abs(distance(centreOf(after[0]), centreOf(after[1])) - 60)).toBeLessThan(5);
    expect(Math.abs(distance(centreOf(after[1]), centreOf(after[2])) - 60)).toBeLessThan(5);
    expect(after.every((child) => child.rotation === 45)).toBe(true);
  });

  test('reorders correctly with a real mouse drag once the frame (and its children) are rotated', async ({ page }) => {
    const designPage = new DesignPage(page);

    // the same 240x100 frame, two 60x60 children — after a rigid 90deg rotate they land at world
    // (710,80) and (710,140) (see the first test above), i.e. centres (740,110) and (740,170)
    await designPage.goto('e2e-test-auto-layout-rotated-frame-drag-reorder');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(ROW_FRAME.x1, ROW_FRAME.y1, ROW_FRAME.x2, ROW_FRAME.y2);
    await setFlowHorizontal(page);
    await setHorizontalGap(page, 0);

    for (let index = 0; index < 2; index += 1) {
      await designPage.drawRectangle(1400, 160, 1460, 220);
      await dragInto(page, { x: 1430, y: 190 }, { x: ROW_FRAME.x2 - 15, y: 200 });
    }

    await rotateFrameRigidly(page, 90);

    const rotated = await getFrameChildren(page);

    // regression: with the drop-target/reorder-ghost math built earlier this session assuming an
    // axis-aligned frame, dragging inside an already-rotated one resolved the wrong insertion index
    // (or an inflated one, per the previous test) — a real mouse drag through the indicator/ghost
    // pipeline must still swap the two children correctly once un-rotated cursor math is used
    await dragInto(page, { x: 740, y: 170 }, { x: 740, y: 90 });

    const after = await getFrameChildren(page);

    // the two children swapped places: the one that used to render second is now first — its
    // position recomputes to the same first-slot geometry the other child had before ((710,80)),
    // so identity (id), not position, is what actually proves the swap happened
    expect(after[0]).toMatchObject({ height: 60, id: rotated[1].id, rotation: 90, width: 60, x: 710, y: 80 });
    expect(after[1]).toMatchObject({ height: 60, id: rotated[0].id, rotation: 90, width: 60, x: 710, y: 140 });
  });
});
