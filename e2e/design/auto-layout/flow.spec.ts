import { test, expect, Locator, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// a frame drawn well clear of the LeftPanel/RightPanel overlays, with room to its right to draw and
// drag in children from outside its own bounds (drawing a shape never auto-parents it into a frame
// under it — only a real drag, which is what the auto-layout drop-target/indicator plumbing needs)
const FRAME = { x1: 600, x2: 1100, y1: 150, y2: 700 };
const FRAME_AREA = { height: FRAME.y2 - FRAME.y1, width: FRAME.x2 - FRAME.x1, x: FRAME.x1, y: FRAME.y1 };

const flowGroup = (page: Page): Locator => page.locator('[data-test-toggle-button-group="flow"]');

const setFlow = async (page: Page, direction: 'Horizontal' | 'Vertical'): Promise<void> => {
  await flowGroup(page).getByLabel(direction, { exact: true }).click();
};

// the Wrap toggle renders next to the Flow group for both Horizontal and Vertical
const clickWrapToggle = async (page: Page): Promise<void> => {
  await page.getByLabel('Wrap', { exact: true }).click();
};

// drags whatever is under (from) to (to), pausing before release so the auto-layout drop
// indicator (computed live off the mousemove) has settled on its final insertion index — mirrors
// frame-nested.spec.ts's own drop-settle wait for the same reason
const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

// selects the frame back via its own Layers-panel row instead of a canvas click — a plain canvas
// click on a frame's own empty body no longer resolves to the frame once it has any child (a real,
// pre-existing bug reproduced separately, unrelated to Flow itself: see the note left in
// docs/test-cases-auto-layout.md). The Layers row is an independent, working selection path
// (`useSelectTreeItem`, no canvas hit-testing involved), so it sidesteps that bug entirely.
const selectFrameRow = async (page: Page): Promise<void> => {
  await page.locator('[class*="Tree__row_"]').filter({ hasText: 'Frame' }).first().click();
};

const readChildIds = async (page: Page): Promise<string[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const frame = activePage.nodes[activePage.rootOrder[0]] as { childIds: string[] };

    return frame.childIds;
  });

const readNodePosition = async (page: Page, nodeId: string): Promise<{ x: number; y: number }> =>
  page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const node = pages[activePageId].nodes[id] as { x: number; y: number };

    return { x: node.x, y: node.y };
  }, nodeId);

test.describe('auto-layout — Flow (Horizontal / Vertical)', () => {
  test('switching Flow reflows the frame’s children, and switching back restores the same layout', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-round-trip');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2); // auto-selects the frame
    await expect(flowGroup(page)).toBeVisible();
    await setFlow(page, 'Horizontal');

    // three children, drawn off to the side and dragged in one at a time, so each goes through the
    // real drop-into-auto-layout-frame path instead of starting out already parented
    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 700, y: 300 });

    await selectFrameRow(page);

    const horizontal = await page.screenshot({ clip: FRAME_AREA });

    await setFlow(page, 'Vertical');
    const vertical = await page.screenshot({ clip: FRAME_AREA });

    expect(vertical.equals(horizontal)).toBe(false);

    await setFlow(page, 'Horizontal');
    const horizontalAgain = await page.screenshot({ clip: FRAME_AREA });

    expect(horizontalAgain.equals(horizontal)).toBe(true);
  });

  test('Horizontal flow repacks the row live as a new child is dragged into the frame', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-horizontal-grows');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Horizontal');

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 700, y: 300 });

    await selectFrameRow(page);
    const withTwoChildren = await page.screenshot({ clip: FRAME_AREA });

    // a third child, dragged in while the frame is already in Horizontal flow, joins the same row
    // live — no need to re-toggle Flow for it to take its place
    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 700, y: 300 });
    await selectFrameRow(page);

    const withThreeChildren = await page.screenshot({ clip: FRAME_AREA });

    expect(withThreeChildren.equals(withTwoChildren)).toBe(false);
  });

  test('Vertical flow arranges mixed node types (rectangle, ellipse, line) as boxes, distinctly from Horizontal', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-mixed-node-types');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Horizontal');

    await designPage.drawRectangle(1400, 160, 1470, 220);
    await dragInto(page, { x: 1435, y: 190 }, { x: 700, y: 300 });

    await designPage.drawEllipse(1400, 300, 1470, 360);
    await dragInto(page, { x: 1435, y: 330 }, { x: 700, y: 300 });

    await designPage.drawLine(1400, 460, 1470, 460);
    await dragInto(page, { x: 1435, y: 460 }, { x: 700, y: 300 });

    await selectFrameRow(page);

    const horizontal = await page.screenshot({ clip: FRAME_AREA });

    await setFlow(page, 'Vertical');
    const vertical = await page.screenshot({ clip: FRAME_AREA });

    expect(vertical.equals(horizontal)).toBe(false);
  });

  test('setting Flow to Vertical for the first time spreads out children that were freely overlapping', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-vertical-cold-start');
    await expect(designPage.canvas).toBeVisible();

    // no Flow set yet — the frame is still freeform, so every child dropped at the same point just
    // stacks exactly on top of the last one instead of being auto-packed
    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 700, y: 300 });

    await selectFrameRow(page);
    const stacked = await page.screenshot({ clip: FRAME_AREA });

    await setFlow(page, 'Vertical');
    const vertical = await page.screenshot({ clip: FRAME_AREA });

    expect(vertical.equals(stacked)).toBe(false);
  });

  test('deleting a child from a Horizontal-flow frame closes the gap live for the remaining children', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-delete-closes-gap');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Horizontal');

    await designPage.drawRectangle(1400, 160, 1460, 220);
    await dragInto(page, { x: 1430, y: 190 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 300, 1460, 360);
    await dragInto(page, { x: 1430, y: 330 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 440, 1460, 500);
    await dragInto(page, { x: 1430, y: 470 }, { x: 700, y: 300 });

    await selectFrameRow(page);
    const withThreeChildren = await page.screenshot({ clip: FRAME_AREA });

    // the most recently dragged-in child sits at the top of its own Layers row group — deleting it
    // should pull the remaining two children together instead of leaving a hole where it was
    await page.locator('[class*="Tree__row_"]').filter({ hasText: 'Rectangle' }).first().click();
    await page.keyboard.press('Delete');

    const afterDelete = await page.screenshot({ clip: FRAME_AREA });

    expect(afterDelete.equals(withThreeChildren)).toBe(false);
  });

  test('Horizontal flow packs five children into a single row, not just two or three', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-horizontal-five-children');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
    await setFlow(page, 'Horizontal');

    for (let index = 0; index < 5; index += 1) {
      const y = 160 + index * 140;

      await designPage.drawRectangle(1400, y, 1440, y + 40);
      await dragInto(page, { x: 1420, y: y + 20 }, { x: 700, y: 300 });
    }

    await selectFrameRow(page);

    const rows = page.locator('[class*="Tree__row_"]');

    await expect(rows.filter({ hasText: 'Rectangle' })).toHaveCount(5);

    const horizontal = await page.screenshot({ clip: FRAME_AREA });

    await setFlow(page, 'Vertical');
    const vertical = await page.screenshot({ clip: FRAME_AREA });

    expect(vertical.equals(horizontal)).toBe(false);
  });

  test('shrinking a comfortably-fitting Horizontal+Wrap frame to half its width pushes the trailing children onto a new row, still laid out left-to-right', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-wrap-resize');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2); // 500px wide
    await setFlow(page, 'Horizontal');
    await clickWrapToggle(page);

    // four 100px-wide children with 100px of slack (400 < the 500px-wide frame) — not squeezed,
    // all four comfortably fit on a single row before the resize below
    for (let index = 0; index < 4; index += 1) {
      const y = 160 + index * 140;

      await designPage.drawRectangle(1400, y, 1500, y + 100);
      await dragInto(page, { x: 1450, y: y + 50 }, { x: 700, y: 300 });
    }

    const before = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const frame = activePage.nodes[activePage.rootOrder[0]] as { childIds: string[] };

      return { childIds: frame.childIds, nodes: activePage.nodes };
    });

    const [idA, idB, idC, idD] = before.childIds;
    const rowY = (before.nodes[idA] as { y: number }).y;

    // confirm the starting point really is a single, uncramped row before touching the resize
    expect((before.nodes[idB] as { y: number }).y).toBe(rowY);
    expect((before.nodes[idC] as { y: number }).y).toBe(rowY);
    expect((before.nodes[idD] as { y: number }).y).toBe(rowY);

    // grab the frame's own east (right-middle) resize handle and drag it to the frame's own
    // horizontal midpoint, halving its width from 500px to 250px
    await selectFrameRow(page);
    const frameMidY = (FRAME.y1 + FRAME.y2) / 2;
    const frameMidX = (FRAME.x1 + FRAME.x2) / 2;

    await designPage.pointerDown(FRAME.x2, frameMidY);
    await designPage.pointerMove(frameMidX, frameMidY);
    await page.waitForTimeout(150);
    await designPage.pointerUp();

    const after = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].nodes;
    });

    const nodeA = after[idA] as { x: number; y: number };
    const nodeB = after[idB] as { x: number; y: number };
    const nodeC = after[idC] as { x: number; y: number };
    const nodeD = after[idD] as { x: number; y: number };

    // a and b (200px, still within the new 250px width) stay on the first row; c and d both wrap
    // onto a second row, and within that row they still lie side by side, left-to-right
    expect(nodeB.y).toBe(nodeA.y);
    expect(nodeC.y).toBe(nodeD.y);
    expect(nodeC.y).toBeGreaterThan(nodeA.y);
    expect(nodeD.x).toBeGreaterThan(nodeC.x);
  });

  test('with Horizontal + Wrap and Bottom-center alignment, a shorter child hangs from the bottom of its line instead of sticking to the top', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-wrap-bottom-alignment');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2); // 500x550
    await setFlow(page, 'Horizontal');
    await page.getByLabel('Bottom center', { exact: true }).click();
    await clickWrapToggle(page);

    // a tall child and a short child, both narrow enough (100+100=200, well under the 500px-wide
    // frame) to land on the same wrapped line together
    await designPage.drawRectangle(1400, 160, 1500, 310); // tall: 100x150
    await dragInto(page, { x: 1450, y: 235 }, { x: 700, y: 300 });

    await designPage.drawRectangle(1400, 400, 1500, 450); // short: 100x50
    await dragInto(page, { x: 1450, y: 425 }, { x: 700, y: 300 });

    const { nodes, rootOrder } = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];

      return { nodes: activePage.nodes, rootOrder: activePage.rootOrder };
    });

    const frame = nodes[rootOrder[0]] as { childIds: string[] };
    const [tallId, shortId] = frame.childIds;
    const tall = nodes[tallId] as { height: number; y: number };
    const short = nodes[shortId] as { height: number; y: number };

    // the shorter child's own bottom edge must land flush with the taller child's bottom edge —
    // not flush with its top, which is what the code did before this fix
    expect(short.y + short.height).toBe(tall.y + tall.height);
  });

  test('shrinking a comfortably-fitting Vertical+Wrap frame to half its height pushes the trailing children onto a new column, still laid out top-to-bottom', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-vertical-wrap-resize');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2); // 500x550
    await setFlow(page, 'Vertical');
    await clickWrapToggle(page);

    // four 100x100 children — comfortably fit in a single column before the resize below
    for (let index = 0; index < 4; index += 1) {
      const y = 160 + index * 140;

      await designPage.drawRectangle(1400, y, 1500, y + 100);
      await dragInto(page, { x: 1450, y: y + 50 }, { x: 700, y: 300 });
    }

    const before = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const frame = activePage.nodes[activePage.rootOrder[0]] as { childIds: string[] };

      return { childIds: frame.childIds, nodes: activePage.nodes };
    });

    const [idA, idB, idC, idD] = before.childIds;
    const columnX = (before.nodes[idA] as { x: number }).x;

    // confirm the starting point really is a single, uncramped column before touching the resize
    expect((before.nodes[idB] as { x: number }).x).toBe(columnX);
    expect((before.nodes[idC] as { x: number }).x).toBe(columnX);
    expect((before.nodes[idD] as { x: number }).x).toBe(columnX);

    // grab the frame's own south (bottom-middle) resize handle and drag it to the frame's own
    // vertical midpoint, roughly halving its height from 550px to 275px
    await selectFrameRow(page);
    const frameMidX = (FRAME.x1 + FRAME.x2) / 2;
    const frameMidY = (FRAME.y1 + FRAME.y2) / 2;

    await designPage.pointerDown(frameMidX, FRAME.y2);
    await designPage.pointerMove(frameMidX, frameMidY);
    await page.waitForTimeout(150);
    await designPage.pointerUp();

    const after = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].nodes;
    });

    const nodeA = after[idA] as { x: number; y: number };
    const nodeB = after[idB] as { x: number; y: number };
    const nodeC = after[idC] as { x: number; y: number };
    const nodeD = after[idD] as { x: number; y: number };

    // a and b (200px, still within the shrunk ~275px height) stay in the first column; c and d
    // both wrap onto a second column, and within that column they still lie top-to-bottom
    expect(nodeB.x).toBe(nodeA.x);
    expect(nodeC.x).toBe(nodeD.x);
    expect(nodeC.x).toBeGreaterThan(nodeA.x);
    expect(nodeD.y).toBeGreaterThan(nodeC.y);
  });

  test('pressing the cross-axis key on a Horizontal+Wrap frame moves a child to become the first item of the next row', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-arrow-cross-horizontal');
    await expect(designPage.canvas).toBeVisible();

    // 220px-wide frame fits exactly two 100px children per row before wrapping
    await designPage.drawFrame(600, 150, 820, 550);
    await setFlow(page, 'Horizontal');
    await clickWrapToggle(page);

    for (let index = 0; index < 4; index += 1) {
      const y = 160 + index * 140;

      await designPage.drawRectangle(1400, y, 1500, y + 100);
      await dragInto(page, { x: 1450, y: y + 50 }, { x: 710, y: 300 });
    }

    const before = await readChildIds(page);
    const rowY = await readNodePosition(page, before[0]).then((position) => position.y);

    // click the first child of row 0 (top-left cell) and press Down to cross into row 1. Once it's
    // excluded, the second child of row 0 (200px total) still fits alongside the third — so row 0
    // reabsorbs the third child, and the moved one lands right after it, genuinely starting row 1
    await designPage.click(650, 200);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);

    const after = await readChildIds(page);
    const movedPosition = await readNodePosition(page, before[0]);

    expect(after).toEqual([before[1], before[2], before[0], before[3]]);
    // the real regression this guards: childIds reordering alone doesn't prove a visual row
    // change — the moved child must actually end up lower on screen, not just shuffled sideways
    // within the same row
    expect(movedPosition.y).toBeGreaterThan(rowY);
  });

  test('pressing Up on a Horizontal+Wrap frame moves a child up into the previous row when that row genuinely has room', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-arrow-cross-up-with-slack');
    await expect(designPage.canvas).toBeVisible();

    // 220px-wide frame: row 0 = two 100px children (200/220px, 20px of slack left); row 1 = a
    // 100px child (didn't fit in row 0) plus a 15px child (small enough to fit row 0's slack)
    await designPage.drawFrame(600, 150, 820, 550);
    await setFlow(page, 'Horizontal');
    await clickWrapToggle(page);

    await designPage.drawRectangle(1400, 160, 1500, 260);
    await dragInto(page, { x: 1450, y: 210 }, { x: 710, y: 300 });
    await designPage.drawRectangle(1400, 300, 1500, 400);
    await dragInto(page, { x: 1450, y: 350 }, { x: 710, y: 300 });
    await designPage.drawRectangle(1400, 440, 1500, 540);
    await dragInto(page, { x: 1450, y: 490 }, { x: 710, y: 300 });
    await designPage.drawRectangle(1400, 580, 1415, 680);
    await dragInto(page, { x: 1407, y: 630 }, { x: 710, y: 300 });

    const before = await readChildIds(page);
    const rowY = await readNodePosition(page, before[0]).then((position) => position.y);

    // click the small (last, 15px-wide) child of row 1 and press Up — it should cross into row 0
    await designPage.click(707, 300);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(150);

    const after = await readChildIds(page);
    const movedPosition = await readNodePosition(page, before[3]);

    expect(after).toEqual([before[0], before[1], before[3], before[2]]);
    expect(movedPosition.y).toBe(rowY);
  });

  test('pressing Up on a Horizontal+Wrap frame evicts row 0’s trailing item to make room when the row is exactly full', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-arrow-cross-up-evicts');
    await expect(designPage.canvas).toBeVisible();

    // 220px-wide frame fits exactly two 100px children per row before wrapping — zero slack
    await designPage.drawFrame(600, 150, 820, 550);
    await setFlow(page, 'Horizontal');
    await clickWrapToggle(page);

    for (let index = 0; index < 4; index += 1) {
      const y = 160 + index * 140;

      await designPage.drawRectangle(1400, y, 1500, y + 100);
      await dragInto(page, { x: 1450, y: y + 50 }, { x: 710, y: 300 });
    }

    const before = await readChildIds(page);
    const rowY = await readNodePosition(page, before[0]).then((position) => position.y);

    // click the last child of row 1 and press Up — row 0 has no slack on its own, but evicting its
    // trailing item (pushed forward to join row 1's remainder) makes room, mirroring how Down
    // already benefits from the vacated row reabsorbing a trailing sibling
    await designPage.click(750, 300);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(150);

    const after = await readChildIds(page);
    const movedPosition = await readNodePosition(page, before[3]);

    expect(after).toEqual([before[0], before[3], before[1], before[2]]);
    expect(movedPosition.y).toBe(rowY);
  });

  test('pressing Up on a Horizontal+Wrap frame is blocked when the child itself is wider than the whole row, even after evicting everything', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-arrow-cross-up-blocked');
    await expect(designPage.canvas).toBeVisible();

    // 220px-wide frame; row 0 = one 100px child; row 1 = one 300px child — far too wide to ever
    // fit in row 0, no matter what gets evicted from it
    await designPage.drawFrame(600, 150, 820, 550);
    await setFlow(page, 'Horizontal');
    await clickWrapToggle(page);

    await designPage.drawRectangle(1400, 160, 1500, 260);
    await dragInto(page, { x: 1450, y: 210 }, { x: 710, y: 300 });
    await designPage.drawRectangle(1400, 300, 1700, 400);
    await dragInto(page, { x: 1550, y: 350 }, { x: 710, y: 300 });

    const before = await readChildIds(page);

    // click the (only) child of row 1 and press Up — it can never fit into row 0
    await designPage.click(750, 300);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(150);

    const after = await readChildIds(page);

    expect(after).toEqual(before);
  });

  test('pressing Up swaps the block into the previous row at the SAME index it occupies in its own row, not the row’s tail', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-arrow-up-swaps-by-index');
    await expect(designPage.canvas).toBeVisible();

    // 300px-wide frame: row 0 fits exactly three 100px children (300/300px, zero slack); row 1 has
    // just one more 100px child, alone
    await designPage.drawFrame(600, 150, 900, 550);
    await setFlow(page, 'Horizontal');
    await clickWrapToggle(page);

    for (let index = 0; index < 4; index += 1) {
      const y = 160 + index * 140;

      await designPage.drawRectangle(1400, y, 1500, y + 100);
      await dragInto(page, { x: 1450, y: y + 50 }, { x: 710, y: 300 });
    }

    const before = await readChildIds(page);
    const rowY = await readNodePosition(page, before[0]).then((position) => position.y);

    // click the (only) child of row 1 — it sits at index 0 of its own row — and press Up. It
    // should swap with row 0's index-0 item ('a'), not get evicted from row 0's tail ('c')
    await designPage.click(650, 300);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(150);

    const after = await readChildIds(page);
    const movedPosition = await readNodePosition(page, before[3]);

    expect(after).toEqual([before[3], before[1], before[2], before[0]]);
    expect(movedPosition.y).toBe(rowY);
  });

  test('pressing the cross-axis key on a Vertical+Wrap frame moves a child to become the first item of the next column (opposite key mapping)', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-arrow-cross-vertical');
    await expect(designPage.canvas).toBeVisible();

    // 220px-tall frame fits exactly two 100px children per column before wrapping
    await designPage.drawFrame(600, 150, 900, 370);
    await setFlow(page, 'Vertical');
    await clickWrapToggle(page);

    for (let index = 0; index < 4; index += 1) {
      const y = 160 + index * 140;

      await designPage.drawRectangle(1400, y, 1500, y + 100);
      await dragInto(page, { x: 1450, y: y + 50 }, { x: 700, y: 200 });
    }

    const before = await readChildIds(page);
    const columnX = await readNodePosition(page, before[0]).then((position) => position.x);

    // click the first child of column 0 (top-left cell) and press Right (not Down) to cross
    // columns — same reabsorption as the Horizontal+Down case (mirrored to the other axis)
    await designPage.click(650, 200);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);

    const after = await readChildIds(page);
    const movedPosition = await readNodePosition(page, before[0]);

    expect(after).toEqual([before[1], before[2], before[0], before[3]]);
    // the real regression this guards: childIds reordering alone doesn't prove a visual column
    // change — the moved child must actually end up further right on screen
    expect(movedPosition.x).toBeGreaterThan(columnX);
  });

  test('pressing the primary-axis key at the edge of a Horizontal frame’s row is blocked', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-arrow-primary-blocked');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 150, 820, 350);
    await setFlow(page, 'Horizontal');

    for (let index = 0; index < 2; index += 1) {
      const y = 160 + index * 140;

      await designPage.drawRectangle(1400, y, 1500, y + 100);
      await dragInto(page, { x: 1450, y: y + 50 }, { x: 710, y: 250 });
    }

    const before = await readChildIds(page);

    // click the last (rightmost) child and press Right — it's already at the end of its only row
    await designPage.click(750, 200);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);

    const after = await readChildIds(page);

    expect(after).toEqual(before);
  });

  test('pressing the cross-axis key on a non-contiguous multi-selection is blocked entirely', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-flow-arrow-non-contiguous-blocked');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 150, 920, 350);
    await setFlow(page, 'Horizontal');

    for (let index = 0; index < 3; index += 1) {
      const y = 160 + index * 140;

      await designPage.drawRectangle(1400, y, 1500, y + 100);
      await dragInto(page, { x: 1450, y: y + 50 }, { x: 710, y: 250 });
    }

    const before = await readChildIds(page);

    // select the first and third children, leaving the middle one unselected — a gap in the
    // selection's own flow order, not just in the press direction
    await designPage.click(650, 200);
    await designPage.click(850, 200, { shift: true });
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);

    const after = await readChildIds(page);

    expect(after).toEqual(before);
  });
});
