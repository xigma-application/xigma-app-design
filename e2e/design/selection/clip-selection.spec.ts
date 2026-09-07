import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// F clips its content; its right edge is at x = 900
const FRAME = { x1: 600, x2: 900, y1: 150, y2: 350 };

const readSelectedIds = (page: Page): Promise<string[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

const readChildId = (page: Page): Promise<string> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const page = pages[activePageId];
    const frame = page.nodes[page.rootOrder[0]] as { childIds: string[] };

    return frame.childIds[0];
  });

const readNodeX = (page: Page, id: string): Promise<number> =>
  page.evaluate(async (nodeId) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return (pages[activePageId].nodes[nodeId] as { x: number }).x;
  }, id);

// draw a 100x60 rectangle off to the side, then drag it so its centre lands at `dropX,dropY`
const dragRectInto = async (designPage: DesignPage, page: Page, dropX: number, dropY: number): Promise<void> => {
  await designPage.drawRectangle(1400, 240, 1500, 300);
  await page.mouse.move(1450, 270);
  await page.mouse.down();
  await page.mouse.move(dropX, dropY, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const buildClipFrameWithOverflowingChild = async (page: Page): Promise<{ childId: string; designPage: DesignPage }> => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-selection-clip');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
  // rect centre at x=885 → rect spans 835..935, straddling the frame's right edge at 900
  await dragRectInto(designPage, page, 885, 250);
  await designPage.click(1650, 650); // deselect

  return { childId: await readChildId(page), designPage };
};

test.describe('selection inside a clipping frame', () => {
  test('a click on the child’s clipped-away overhang selects nothing', async ({ page }) => {
    await buildClipFrameWithOverflowingChild(page);

    await new DesignPage(page).click(925, 250); // x > 900 — outside the frame, over the clipped part

    expect(await readSelectedIds(page)).toEqual([]);
  });

  test('a click on the child’s still-visible part selects it', async ({ page }) => {
    const { childId } = await buildClipFrameWithOverflowingChild(page);

    await new DesignPage(page).click(860, 250); // inside the frame, on the child

    expect(await readSelectedIds(page)).toEqual([childId]);
  });

  test('a marquee that only sweeps the clipped-away overhang selects nothing', async ({ page }) => {
    const { designPage } = await buildClipFrameWithOverflowingChild(page);

    await designPage.selectTool('default');
    await designPage.pointerDown(908, 215);
    await designPage.pointerMove(970, 285);
    await designPage.pointerUp();

    expect(await readSelectedIds(page)).toEqual([]);
  });

  test('a marquee that reaches the child’s still-visible sliver selects it', async ({ page }) => {
    const { childId, designPage } = await buildClipFrameWithOverflowingChild(page);

    await designPage.selectTool('default');
    await designPage.pointerDown(820, 215);
    await designPage.pointerMove(895, 285);
    await designPage.pointerUp();

    expect(await readSelectedIds(page)).toEqual([childId]);
  });

  test('once selected, the child is still grabbable by its clipped-away overhang', async ({ page }) => {
    const { childId, designPage } = await buildClipFrameWithOverflowingChild(page);

    await designPage.click(860, 250); // select it on the visible part
    expect(await readSelectedIds(page)).toEqual([childId]);

    const startX = await readNodeX(page, childId);

    // grab it on the overhang (x > 900) and drag left by 40px
    await designPage.pointerDown(925, 250);
    await designPage.pointerMove(885, 250);
    await designPage.pointerUp();

    expect(await readNodeX(page, childId)).toBeLessThan(startX);
  });
});
