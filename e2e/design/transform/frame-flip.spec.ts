import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TNodeSnapshot = Record<string, unknown> & { childIds?: string[]; height: number; id: string; width: number; x: number; y: number };

const readTree = (page: Page): Promise<{ children: TNodeSnapshot[]; frame: TNodeSnapshot; nodes: Record<string, TNodeSnapshot> }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const nodes = activePage.nodes as unknown as Record<string, TNodeSnapshot>;
    const frame = nodes[activePage.rootOrder[0]];

    return { children: (frame.childIds ?? []).map((id) => nodes[id]), frame, nodes };
  });

const updateNodeInStore = (page: Page, id: string, changes: Record<string, unknown>): Promise<void> =>
  page.evaluate(
    async ({ changes: nodeChanges, id: nodeId }) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(updateNode({ changes: nodeChanges, id: nodeId }));
    },
    { changes, id },
  );

const selectFrame = async (designPage: DesignPage): Promise<void> => {
  await designPage.click(615, 188); // the frame's name label, just above its top-left corner at x 600
};

test.describe('Flip a single frame', () => {
  test('free-form: Shift+H keeps the frame in place, mirrors its child and its constraint, and swaps left/right settings and guides', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-frame-flip-free-form-h');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 1000, 400);
    await designPage.drawRectangle(620, 220, 660, 260);

    const { frame } = await readTree(page);

    await updateNodeInStore(page, frame.id, {
      cornerRadiusTopLeft: 12,
      guides: [{ axis: 'x', id: 'e2e-guide', position: 100 }],
      layoutGuides: [{ color: '#ff0000', columnsAlign: 'left', opacity: 10, type: 'columns' }],
      paddingLeft: 4,
      paddingRight: 16,
    });
    await updateNodeInStore(page, frame.childIds?.[0] ?? '', { alignment: { horizontal: 'left', vertical: 'top' } });
    await selectFrame(designPage);

    const before = await readTree(page);

    await page.keyboard.press('Shift+H');

    const after = await readTree(page);
    const [childBefore] = before.children;
    const [childAfter] = after.children;

    expect(after.frame).toMatchObject({ cornerRadiusTopRight: 12, paddingLeft: 16, paddingRight: 4, x: before.frame.x, y: before.frame.y });
    expect(childAfter.x).toBe(before.frame.x + before.frame.width - (childBefore.x - before.frame.x) - childBefore.width);
    expect(childAfter.y).toBe(childBefore.y);
    expect(childAfter.alignment).toEqual({ horizontal: 'right', vertical: 'top' });
    expect(after.frame.guides).toEqual([{ axis: 'x', id: 'e2e-guide', position: before.frame.width - 100 }]);
    expect((after.frame.layoutGuides as { columnsAlign: string }[])[0].columnsAlign).toBe('right');
  });

  test('free-form: Shift+V mirrors the child vertically and swaps top/bottom settings', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-frame-flip-free-form-v');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 1000, 400);
    await designPage.drawRectangle(620, 220, 660, 260);

    const { frame } = await readTree(page);

    await updateNodeInStore(page, frame.id, { paddingBottom: 2, paddingTop: 10 });
    await selectFrame(designPage);

    const before = await readTree(page);

    await page.keyboard.press('Shift+V');

    const after = await readTree(page);
    const [childBefore] = before.children;
    const [childAfter] = after.children;

    expect(after.frame).toMatchObject({ paddingBottom: 10, paddingTop: 2, y: before.frame.y });
    expect(childAfter.y).toBe(before.frame.y + before.frame.height - (childBefore.y - before.frame.y) - childBefore.height);
    expect(childAfter.x).toBe(childBefore.x);
  });

  test('nested frame: its position mirrors inside the parent and its own child mirrors inside it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-frame-flip-nested');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 1000, 400);
    await designPage.drawFrame(620, 220, 720, 320);
    await designPage.drawRectangle(630, 240, 650, 260);
    await selectFrame(designPage);

    const before = await readTree(page);
    const [innerBefore] = before.children;
    const grandchildBefore = before.nodes[innerBefore.childIds?.[0] ?? ''];

    await page.keyboard.press('Shift+H');

    const after = await readTree(page);
    const innerAfter = after.nodes[innerBefore.id];
    const grandchildAfter = after.nodes[grandchildBefore.id];

    expect(innerAfter.x).toBe(before.frame.x + before.frame.width - (innerBefore.x - before.frame.x) - innerBefore.width);
    expect(grandchildAfter.x - innerAfter.x).toBe(innerBefore.width - (grandchildBefore.x - innerBefore.x) - grandchildBefore.width);
  });

  test('horizontal auto layout: Shift+H moves the children to the other side and keeps their order', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-frame-flip-auto-layout-h');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 1000, 400);
    await designPage.drawRectangle(620, 220, 660, 260);
    await designPage.drawRectangle(680, 220, 720, 260);

    const { frame } = await readTree(page);

    await updateNodeInStore(page, frame.id, { layoutAlignment: 'topLeft', layoutMode: 'horizontal' });
    await selectFrame(designPage);

    const before = await readTree(page);

    await page.keyboard.press('Shift+H');

    const after = await readTree(page);

    expect(after.frame.layoutAlignment).toBe('topRight');
    expect(after.frame.childIds).toEqual(before.frame.childIds);
    expect(after.children[1].x + after.children[1].width).toBe(after.frame.x + after.frame.width);
    expect(after.children[0].x).toBeLessThan(after.children[1].x);
  });

  test('vertical auto layout: Shift+V moves the children to the bottom', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-frame-flip-auto-layout-v');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 1000, 400);
    await designPage.drawRectangle(620, 220, 660, 260);
    await designPage.drawRectangle(620, 280, 660, 320);

    const { frame } = await readTree(page);

    await updateNodeInStore(page, frame.id, { layoutAlignment: 'topLeft', layoutMode: 'vertical' });
    await selectFrame(designPage);
    await page.keyboard.press('Shift+V');

    const after = await readTree(page);
    const lastChild = after.children[after.children.length - 1];

    expect(after.frame.layoutAlignment).toBe('bottomLeft');
    expect(lastChild.y + lastChild.height).toBe(after.frame.y + after.frame.height);
  });

  test('grid: a layer spanning two columns and two rows lands on the mirrored cells, and its position changes', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-frame-flip-grid-span');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 900, 500);
    await designPage.drawRectangle(620, 220, 660, 260);
    await designPage.drawRectangle(700, 300, 740, 340);

    const { children, frame } = await readTree(page);
    const [wideId, smallId] = children.map((child) => child.id);

    await updateNodeInStore(page, frame.id, { gridAutoPlacement: false, gridColumnCount: 3, gridRowCount: 3, layoutMode: 'grid' });
    await updateNodeInStore(page, wideId, { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0, gridRowSpan: 2 });
    await updateNodeInStore(page, smallId, { gridColumnAnchorIndex: 2, gridColumnSpan: 1, gridRowAnchorIndex: 2, gridRowSpan: 1 });
    await selectFrame(designPage);

    const before = await readTree(page);

    await page.keyboard.press('Shift+H');

    const afterHorizontal = await readTree(page);

    expect(afterHorizontal.nodes[wideId]).toMatchObject({
      gridColumnAnchorIndex: 1,
      gridColumnSpan: 2,
      gridRowAnchorIndex: 0,
      gridRowSpan: 2,
    });
    expect(afterHorizontal.nodes[smallId]).toMatchObject({ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 2 });
    expect(afterHorizontal.nodes[wideId].x).toBeGreaterThan(before.nodes[wideId].x);
    expect(afterHorizontal.nodes[smallId].x).toBeLessThan(before.nodes[smallId].x);

    await page.keyboard.press('Shift+V');

    const afterVertical = await readTree(page);

    expect(afterVertical.nodes[wideId]).toMatchObject({ gridColumnAnchorIndex: 1, gridRowAnchorIndex: 1, gridRowSpan: 2 });
    expect(afterVertical.nodes[smallId]).toMatchObject({ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0 });
    expect(afterVertical.nodes[wideId].y).toBeGreaterThan(afterHorizontal.nodes[wideId].y);
    expect(afterVertical.nodes[smallId].y).toBeLessThan(afterHorizontal.nodes[smallId].y);
  });

  test('Ctrl+Z undoes the whole frame flip in one step', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-frame-flip-undo');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 1000, 400);
    await designPage.drawRectangle(620, 220, 660, 260);
    await selectFrame(designPage);

    const before = await readTree(page);

    await page.keyboard.press('Shift+H');
    await page.keyboard.press('Control+z');

    const after = await readTree(page);

    expect(after.children[0].x).toBe(before.children[0].x);
  });

  test('the Flip horizontal button in the right panel is enabled for a frame and mirrors its child', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-frame-flip-panel-button');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 1000, 400);
    await designPage.drawRectangle(620, 220, 660, 260);
    await selectFrame(designPage);

    const before = await readTree(page);
    const flipButton = page.getByLabel('Flip horizontal', { exact: true });

    await expect(flipButton).toBeEnabled();
    await flipButton.click();

    const after = await readTree(page);
    const [childBefore] = before.children;

    expect(after.children[0].x).toBe(before.frame.x + before.frame.width - (childBefore.x - before.frame.x) - childBefore.width);
  });

  test('horizontal auto layout with wrap: Shift+V moves the last line to the top and keeps the order inside the line', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-frame-flip-wrap-v');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 200, 700, 400);
    await designPage.drawRectangle(610, 210, 640, 240);
    await designPage.drawRectangle(645, 210, 675, 240);
    await designPage.drawRectangle(610, 250, 640, 280);
    await designPage.drawRectangle(645, 250, 675, 280);

    const { children, frame } = await readTree(page);

    await Promise.all(children.map((child) => updateNodeInStore(page, child.id, { height: 30, width: 30 })));
    await updateNodeInStore(page, frame.id, { horizontalGap: 0, layoutMode: 'horizontal', layoutWrap: true, verticalGap: 0, width: 100 });
    await selectFrame(designPage);

    const before = await readTree(page);
    const [first, second, third, fourth] = before.frame.childIds ?? [];

    await page.keyboard.press('Shift+V');

    const after = await readTree(page);

    expect(after.frame.childIds).toEqual([fourth, first, second, third]);
    expect(after.nodes[fourth].y).toBe(after.nodes[first].y);
    expect(after.nodes[third].y).toBeGreaterThan(after.nodes[fourth].y);
  });
});
