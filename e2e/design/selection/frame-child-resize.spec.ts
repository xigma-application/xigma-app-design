import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// a freeform frame whose left edge is at screen x = 600, right edge at x = 900
const FRAME = { x1: 600, x2: 900, y1: 200, y2: 400 };

type TBox = { x: number; y: number };
type TFrameBox = { height: number; rotation: number; width: number; x: number; y: number };

// world position of the frame's (unrotated-local) top-left corner — the point children are pinned to
const worldTopLeft = (f: TFrameBox): TBox => {
  const cx = f.x + f.width / 2;
  const cy = f.y + f.height / 2;
  const rad = (f.rotation * Math.PI) / 180;
  const dx = f.x - cx;
  const dy = f.y - cy;

  return { x: cx + dx * Math.cos(rad) - dy * Math.sin(rad), y: cy + dx * Math.sin(rad) + dy * Math.cos(rad) };
};

const readFrameBox = (page: Page): Promise<TFrameBox> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const f = activePage.nodes[activePage.rootOrder[0]] as unknown as TFrameBox;

    return { height: f.height, rotation: f.rotation, width: f.width, x: f.x, y: f.y };
  });

const readFrame = (page: Page): Promise<TBox> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const frame = activePage.nodes[activePage.rootOrder[0]] as unknown as { x: number; y: number };

    return { x: frame.x, y: frame.y };
  });

const readChild = (page: Page): Promise<TBox> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const frame = activePage.nodes[activePage.rootOrder[0]] as unknown as { childIds: string[] };
    const child = activePage.nodes[frame.childIds[0]] as unknown as { x: number; y: number };

    return { x: child.x, y: child.y };
  });

const rotateFrame = (page: Page, rotation: number): Promise<void> =>
  page.evaluate(async (nodeRotation) => {
    const { store } = await import('/src/store/index.ts');
    const { updateNode } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;
    const [frameId] = pages[activePageId].rootOrder;

    store.dispatch(updateNode({ changes: { rotation: nodeRotation }, id: frameId }));
  }, rotation);

// clicking a freeform frame's blank interior selects nothing in this app, so select it via the store
const selectFrame = (page: Page): Promise<void> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection([pages[activePageId].rootOrder[0]]));
  });

// draw a rect outside the frame, then drag its centre to `dropX,dropY` so it becomes a frame child
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

  await designPage.goto('e2e-test-frame-child-resize');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(FRAME.x1, FRAME.y1, FRAME.x2, FRAME.y2);
  await dropChildAt(designPage, page, 750, 300); // centre of the frame

  return designPage;
};

test.describe('resizing a freeform frame and its children', () => {
  test('the left edge carries the children, the right edge does not', async ({ page }) => {
    const designPage = await buildFrameWithChild(page);

    await selectFrame(page);

    const frameBefore = await readFrame(page);
    const childBefore = await readChild(page);

    // drag the left-edge handle 50px left
    await designPage.pointerDown(600, 300);
    await designPage.pointerMove(550, 300);
    await designPage.pointerUp();

    const frameAfterLeft = await readFrame(page);
    const childAfterLeft = await readChild(page);
    const frameDx = frameAfterLeft.x - frameBefore.x;

    expect(frameDx).toBeLessThan(0); // the frame origin actually moved left
    expect(childAfterLeft.x - childBefore.x).toBeCloseTo(frameDx, 0); // the child rode along by the same delta
    expect(childAfterLeft.y).toBeCloseTo(childBefore.y, 0);

    // now drag the right-edge handle 50px right — width grows, origin stays put
    await designPage.pointerDown(900, 300);
    await designPage.pointerMove(950, 300);
    await designPage.pointerUp();

    const frameAfterRight = await readFrame(page);
    const childAfterRight = await readChild(page);

    expect(frameAfterRight.x).toBeCloseTo(frameAfterLeft.x, 0); // origin unchanged
    expect(childAfterRight.x).toBeCloseTo(childAfterLeft.x, 0); // child untouched
    expect(childAfterRight.y).toBeCloseTo(childAfterLeft.y, 0);
  });

  test('a rotated frame carries its children along its own local axis', async ({ page }) => {
    const designPage = await buildFrameWithChild(page);

    await selectFrame(page);
    await rotateFrame(page, 90);

    const frameBefore = await readFrameBox(page);
    const childBefore = await readChild(page);

    // drag a handle — a rotated resize shifts the frame's stored origin
    await designPage.pointerDown(750, 400);
    await designPage.pointerMove(750, 460);
    await designPage.pointerUp();

    const frameAfter = await readFrameBox(page);
    const childAfter = await readChild(page);
    const cornerBefore = worldTopLeft(frameBefore);
    const cornerAfter = worldTopLeft(frameAfter);
    const cornerDx = cornerAfter.x - cornerBefore.x;
    const cornerDy = cornerAfter.y - cornerBefore.y;

    expect(Math.abs(cornerDx) + Math.abs(cornerDy)).toBeGreaterThan(1); // the local top-left corner really moved
    expect(childAfter.x - childBefore.x).toBeCloseTo(cornerDx, 0); // the child tracked it, along the local axis
    expect(childAfter.y - childBefore.y).toBeCloseTo(cornerDy, 0);
  });
});
