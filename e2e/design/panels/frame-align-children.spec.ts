import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TRect = { height: number; width: number; x: number; y: number };

const readFrameAndChildren = (page: Page): Promise<{ children: TRect[]; frame: TRect }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const frame = activePage.nodes[activePage.rootOrder[0]] as unknown as TRect & { childIds: string[] };
    const toRect = (node: TRect): TRect => ({ height: node.height, width: node.width, x: node.x, y: node.y });

    return {
      children: frame.childIds.map((id) => toRect(activePage.nodes[id] as unknown as TRect)),
      frame: toRect(frame),
    };
  });

const drawTwoChildrenAndSelectFrame = async (designPage: DesignPage): Promise<void> => {
  await designPage.drawRectangle(650, 250, 690, 290);
  await designPage.drawRectangle(700, 350, 800, 410);
  await designPage.click(615, 188); // the frame's name label, just above its top-left corner
};

test('Align right on a top-level free-form frame moves every child to the frame’s right edge, and Ctrl+Z restores them in one step', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-align-children');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(600, 200, 1000, 500);
  await drawTwoChildrenAndSelectFrame(designPage);

  const before = await readFrameAndChildren(page);

  expect(before.children).toHaveLength(2);

  await page.getByLabel('Align right', { exact: true }).click();

  const after = await readFrameAndChildren(page);

  after.children.forEach((child, index) => {
    expect(child.x + child.width).toBe(after.frame.x + after.frame.width);
    expect(child.y).toBe(before.children[index].y);
  });
  expect(after.frame).toEqual(before.frame);

  await page.keyboard.press('Control+z');

  expect((await readFrameAndChildren(page)).children).toEqual(before.children);
});

test('the More actions menu next to Alignment shows its tooltip and lists Tidy up and both spacing items for a free-form frame with children', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-align-children-distribute');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(600, 200, 1000, 500); // auto-selected, no children yet
  await expect(page.getByLabel('More actions')).toHaveCount(0);

  await drawTwoChildrenAndSelectFrame(designPage);
  await page.getByLabel('More actions').hover();
  await expect(page.getByRole('tooltip')).toHaveText('More actions');

  await page.getByLabel('More actions').click();

  await expect(page.getByText('Tidy up', { exact: true })).toBeVisible();
  await expect(page.getByText('Distribute vertical spacing', { exact: true })).toBeVisible();
  await expect(page.getByText('Distribute horizontal spacing', { exact: true })).toBeVisible();
});

test('Distribute horizontal spacing on a top-level free-form frame evens out the gaps between its three children, keeping the outermost ones in place', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-distribute-children');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(600, 200, 1000, 500);
  await designPage.drawRectangle(620, 250, 660, 290);
  await designPage.drawRectangle(680, 250, 720, 290);
  await designPage.drawRectangle(900, 250, 940, 290);
  await designPage.click(615, 188); // the frame's name label

  const before = await readFrameAndChildren(page);
  const sortedLeftEdges = (children: TRect[]): number[] => children.map((child) => child.x).sort((a, b) => a - b);

  await page.getByLabel('More actions').click();
  await page.getByText('Distribute horizontal spacing', { exact: true }).click();

  const [left, middle, right] = sortedLeftEdges((await readFrameAndChildren(page)).children);
  const [beforeLeft, , beforeRight] = sortedLeftEdges(before.children);

  expect(left).toBe(beforeLeft);
  expect(right).toBe(beforeRight);
  expect(middle - (left + 40)).toBeCloseTo(right - (middle + 40));
});

test('with two frames selected, Align left moves both frames to the selection’s left edge and leaves their children where they sit inside them', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-align-multi');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(600, 200, 800, 300);
  await designPage.drawRectangle(700, 220, 740, 260); // a child inside the first frame
  await designPage.drawFrame(900, 400, 1000, 500);
  await designPage.click(615, 188); // the first frame's label
  await designPage.click(915, 388, { shift: true }); // the second frame's label

  const readRootFrames = (): Promise<{ childX: number; frames: TRect[] }> =>
    page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const frames = activePage.rootOrder.map((id) => activePage.nodes[id] as unknown as TRect & { childIds: string[] });
      const child = activePage.nodes[frames[0].childIds[0]] as unknown as TRect;

      return { childX: child.x, frames: frames.map((frame) => ({ height: frame.height, width: frame.width, x: frame.x, y: frame.y })) };
    });

  const before = await readRootFrames();

  await page.getByLabel('Align left', { exact: true }).click();

  const after = await readRootFrames();

  expect(after.frames[0].x).toBe(before.frames[0].x);
  expect(after.frames[1].x).toBe(before.frames[0].x);
  expect(after.frames[1].y).toBe(before.frames[1].y);
  expect(after.childX).toBe(before.childX);
});

test('Tidy up on a multi-selected row of frames evens out their gaps to the most common one', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-tidy-up-row');
  await expect(designPage.canvas).toBeVisible();

  // four 40px frames in a row, gaps of 20, 20 and 100
  await designPage.drawFrame(600, 300, 640, 340);
  await designPage.drawFrame(660, 300, 700, 340);
  await designPage.drawFrame(720, 300, 760, 340);
  await designPage.drawFrame(860, 300, 900, 340);
  await designPage.click(620, 320);
  await designPage.click(680, 320, { shift: true });
  await designPage.click(740, 320, { shift: true });
  await designPage.click(880, 320, { shift: true });

  const readLeftEdges = (): Promise<number[]> =>
    page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];

      return activePage.rootOrder.map((id) => (activePage.nodes[id] as unknown as { x: number }).x).sort((a, b) => a - b);
    });

  const before = await readLeftEdges();

  await page.getByLabel('More actions').click();
  await page.getByText('Tidy up', { exact: true }).click();

  const after = await readLeftEdges();

  expect(after[0]).toBe(before[0]);
  expect(after.slice(1).map((x, index) => x - after[index])).toEqual([60, 60, 60]);
});
