import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// a freeform frame: left edge screen x = 600, right edge x = 900, 200 tall
const FRAME = { x1: 600, x2: 900, y1: 200, y2: 400 };

type TRect = { height: number; width: number; x: number; y: number };
type TAlignment = { horizontal?: string; vertical?: string };

const readFrame = (page: Page): Promise<TRect> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const f = pages[activePageId].nodes[pages[activePageId].rootOrder[0]] as unknown as TRect;

    return { height: f.height, width: f.width, x: f.x, y: f.y };
  });

const readChild = (page: Page): Promise<TRect> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const frame = activePage.nodes[activePage.rootOrder[0]] as unknown as { childIds: string[] };
    const c = activePage.nodes[frame.childIds[0]] as unknown as TRect;

    return { height: c.height, width: c.width, x: c.x, y: c.y };
  });

// records the constraint only — mirrors the Constraints dropdown, which never moves the element
const setConstraintOnly = (page: Page, alignment: TAlignment): Promise<void> =>
  page.evaluate(async (align) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const frame = activePage.nodes[activePage.rootOrder[0]] as unknown as { childIds: string[] };

    store.dispatch(updateNode({ changes: { alignment: align }, id: frame.childIds[0] }));
  }, alignment);

// records the constraint AND snaps the child to that anchor — mirrors clicking an Alignment button
const alignChild = (page: Page, alignment: TAlignment): Promise<void> =>
  page.evaluate(async (align) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const frame = activePage.nodes[activePage.rootOrder[0]] as unknown as {
      childIds: string[];
      height: number;
      width: number;
      x: number;
      y: number;
    };
    const child = activePage.nodes[frame.childIds[0]] as unknown as { height: number; width: number };

    const anchorX =
      align.horizontal === 'left'
        ? frame.x
        : align.horizontal === 'center'
          ? frame.x + (frame.width - child.width) / 2
          : align.horizontal === 'right'
            ? frame.x + frame.width - child.width
            : undefined;
    const anchorY =
      align.vertical === 'top'
        ? frame.y
        : align.vertical === 'center'
          ? frame.y + (frame.height - child.height) / 2
          : align.vertical === 'bottom'
            ? frame.y + frame.height - child.height
            : undefined;

    store.dispatch(
      updateNode({
        changes: {
          alignment: align,
          ...(anchorX !== undefined && { x: Math.round(anchorX) }),
          ...(anchorY !== undefined && { y: Math.round(anchorY) }),
        },
        id: frame.childIds[0],
      }),
    );
  }, alignment);

const rotateNode = (page: Page, target: 'child' | 'frame', rotation: number): Promise<void> =>
  page.evaluate(
    async ({ deg, which }) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const frame = activePage.nodes[activePage.rootOrder[0]] as unknown as { childIds: string[]; id: string };

      store.dispatch(updateNode({ changes: { rotation: deg }, id: which === 'frame' ? frame.id : frame.childIds[0] }));
    },
    { deg: rotation, which: target },
  );

const selectFrame = (page: Page): Promise<void> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection([pages[activePageId].rootOrder[0]]));
  });

const selectChild = (page: Page, alsoSecondRect = false): Promise<void> =>
  page.evaluate(async (withSecond) => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const frame = activePage.nodes[activePage.rootOrder[0]] as unknown as { childIds: string[] };
    const ids = [frame.childIds[0]];

    if (withSecond) {
      ids.push(activePage.rootOrder[activePage.rootOrder.length - 1]);
    }

    store.dispatch(setSelection(ids));
  }, alsoSecondRect);

const dropChildAt = async (designPage: DesignPage, page: Page, dropX: number, dropY: number): Promise<void> => {
  await designPage.drawRectangle(1400, 240, 1460, 300);
  await page.mouse.move(1430, 270);
  await page.mouse.down();
  await page.mouse.move(dropX, dropY, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const buildFrameWithChild = async (page: Page): Promise<DesignPage> => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-child-constraints');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
  await dropChildAt(designPage, page, 750, 300); // roughly centred in the frame

  return designPage;
};

const resizeRightEdgeBy = async (designPage: DesignPage): Promise<void> => {
  await designPage.pointerDown(900, 300);
  await designPage.pointerMove(960, 300);
  await designPage.pointerUp();
};

test.describe('constraints reflow when the parent frame resizes', () => {
  test('a centre-anchored child keeps its centre on the frame centre', async ({ page }) => {
    const designPage = await buildFrameWithChild(page);

    await alignChild(page, { horizontal: 'center' });
    await selectFrame(page);
    await resizeRightEdgeBy(designPage);

    const frame = await readFrame(page);
    const child = await readChild(page);

    expect(child.x + child.width / 2).toBeCloseTo(frame.x + frame.width / 2, 0);
  });

  test('a right-anchored child keeps its right edge flush with the frame right edge', async ({ page }) => {
    const designPage = await buildFrameWithChild(page);

    await alignChild(page, { horizontal: 'right' });
    await selectFrame(page);
    await resizeRightEdgeBy(designPage);

    const frame = await readFrame(page);
    const child = await readChild(page);

    expect(child.x + child.width).toBeCloseTo(frame.x + frame.width, 0);
  });

  test('a free (unaligned) child does not re-anchor on resize', async ({ page }) => {
    const designPage = await buildFrameWithChild(page);

    await selectFrame(page);
    const before = await readChild(page);

    // right-edge drag: the frame origin does not move, so a free child stays put
    await resizeRightEdgeBy(designPage);

    expect(await readChild(page)).toEqual(before);
  });

  test('setting a constraint alone never moves the child — only a later resize preserves its current gap', async ({ page }) => {
    const designPage = await buildFrameWithChild(page);

    await setConstraintOnly(page, { horizontal: 'right' });
    await selectFrame(page);

    const beforeChild = await readChild(page);
    const beforeFrame = await readFrame(page);

    expect(beforeChild.x).toBeCloseTo(720, 0); // unmoved — dropped roughly centred, not flush right

    const gapBefore = beforeFrame.x + beforeFrame.width - (beforeChild.x + beforeChild.width);

    await resizeRightEdgeBy(designPage);

    const afterChild = await readChild(page);
    const afterFrame = await readFrame(page);
    const gapAfter = afterFrame.x + afterFrame.width - (afterChild.x + afterChild.width);

    expect(gapAfter).toBeCloseTo(gapBefore, 0);
  });
});

test.describe('constraint guide lines on the canvas', () => {
  test('the guide lines shift when the sole-selected child’s constraint changes', async ({ page }) => {
    const designPage = await buildFrameWithChild(page);

    await selectChild(page);
    await page.waitForTimeout(100);
    const leftTop = await designPage.canvas.screenshot();

    await setConstraintOnly(page, { horizontal: 'right', vertical: 'bottom' });
    await page.waitForTimeout(100);
    const rightBottom = await designPage.canvas.screenshot();

    // the lines re-anchored from the child's left/top edges to its right/bottom edges
    expect(leftTop.equals(rightBottom)).toBe(false);
  });

  test('the guide lines re-anchor to a rotated child’s current extent', async ({ page }) => {
    const designPage = await buildFrameWithChild(page);

    await rotateNode(page, 'child', 30);
    await selectChild(page);
    await setConstraintOnly(page, { horizontal: 'left', vertical: 'top' });
    await page.waitForTimeout(100);
    const rotatedLeftTop = await designPage.canvas.screenshot();

    // the child never moves on a constraint change, so only the guide lines can differ here
    await setConstraintOnly(page, { horizontal: 'right', vertical: 'bottom' });
    await page.waitForTimeout(100);
    const rotatedRightBottom = await designPage.canvas.screenshot();

    expect(rotatedLeftTop.equals(rotatedRightBottom)).toBe(false);
  });

  test('the guide lines and centre marker follow a rotated parent frame', async ({ page }) => {
    const designPage = await buildFrameWithChild(page);

    await selectChild(page);
    await setConstraintOnly(page, { horizontal: 'center', vertical: 'center' });
    await page.waitForTimeout(100);
    const uprightFrame = await designPage.canvas.screenshot();

    await rotateNode(page, 'frame', 20);
    await page.waitForTimeout(100);
    const rotatedFrame = await designPage.canvas.screenshot();

    expect(uprightFrame.equals(rotatedFrame)).toBe(false);
  });

  test('no guide lines are drawn while more than one node is selected', async ({ page }) => {
    const designPage = await buildFrameWithChild(page);

    await designPage.drawRectangle(1000, 500, 1060, 560); // a second, unrelated top-level node

    await setConstraintOnly(page, { horizontal: 'right', vertical: 'bottom' });
    await selectChild(page, true);
    await page.waitForTimeout(100);
    const withRightBottom = await designPage.canvas.screenshot();

    await setConstraintOnly(page, { horizontal: 'left', vertical: 'top' });
    await selectChild(page, true);
    await page.waitForTimeout(100);
    const withLeftTop = await designPage.canvas.screenshot();

    // under a multi-selection the child's constraint has no visual effect at all — guides suppressed
    expect(withRightBottom.equals(withLeftTop)).toBe(true);
  });
});

test.describe('keyboard nudge of a frame child', () => {
  test('arrow keys move a sole-selected freeform-frame child', async ({ page }) => {
    await buildFrameWithChild(page);

    await selectChild(page);
    const before = await readChild(page);

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');

    const after = await readChild(page);

    expect(after.x).toBe(before.x + 2);
    expect(after.y).toBe(before.y + 1);
  });
});
