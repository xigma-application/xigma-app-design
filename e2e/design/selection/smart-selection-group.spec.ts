import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

const readActivePage = (
  page: DesignPage['page'],
): Promise<{
  children: { id: string; width: number; x: number; y: number }[];
  group: { childIds: string[]; type: string; width: number; x: number };
}> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [groupId] = activePage.selectedIds;
    const group = activePage.nodes[groupId] as { childIds: string[]; type: string; width: number; x: number };
    const children = group.childIds
      .map((id) => activePage.nodes[id] as { id: string; width: number; x: number; y: number })
      .sort((a, b) => a.x - b.x);

    return { children, group };
  });

test('the Smart Selection gap handle works on a selected group and resyncs the group box, undoing in one step', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-smart-selection-group-gap');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 750, 350); // A — auto-selected
  await designPage.drawRectangle(800, 300, 850, 350); // B — auto-selected, replaces A
  await designPage.click(720, 320, { shift: true }); // add A back — both selected
  await page.keyboard.press('Control+g'); // group them; selection becomes [group]

  const before = await readActivePage(designPage.page);
  expect(before.group.type).toBe('group');

  const [leftBefore, rightBefore] = before.children;
  const gapMidX = (leftBefore.x + leftBefore.width + rightBefore.x) / 2;
  const gapMidY = leftBefore.y + 25;
  const growBy = 30;

  await designPage.pointerMove(gapMidX, gapMidY); // arm the box-hover so the handles draw
  await designPage.pointerDown(gapMidX, gapMidY);
  await page.mouse.move(gapMidX + growBy, gapMidY, { steps: 5 });
  await designPage.pointerUp();

  const after = await readActivePage(designPage.page);
  const [leftAfter, rightAfter] = after.children;

  // the anchor child stays put; the far child is pushed by 2x the pointer's own move
  expect(leftAfter).toMatchObject({ x: leftBefore.x, y: leftBefore.y });
  expect(rightAfter).toMatchObject({ x: rightBefore.x + growBy * 2, y: rightBefore.y });
  // the group's own box grew to still wrap both children
  expect(after.group.x).toBe(before.group.x);
  expect(after.group.width).toBe(before.group.width + growBy * 2);

  await page.keyboard.press('Control+z');

  const afterUndo = await readActivePage(designPage.page);
  expect(afterUndo.children[1]).toMatchObject({ x: rightBefore.x, y: rightBefore.y });
  expect(afterUndo.group.width).toBe(before.group.width);
});

test('widening a group’s gap with the Smart Selection handle reflows the auto-layout frame it lives in — live, mid-drag — sliding its next sibling over', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-smart-selection-group-gap-reflows-autolayout');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(600, 150, 1100, 700);
  await page.locator('[data-test-toggle-button-group="flow"]').getByLabel('Horizontal', { exact: true }).click();

  // A and B, drawn off to the side and grouped, become the frame's first auto-layout member. Made
  // tall (80px) so the gap-drag and reselect points below can sit well clear of the frame's own
  // top-left corner, since 0-padding auto-layout snaps this first member flush against it
  await designPage.drawRectangle(1400, 300, 1450, 380); // A
  await designPage.drawRectangle(1460, 300, 1510, 380); // B — auto-selected, replacing A
  await designPage.click(1408, 370, { shift: true }); // add A back (near its bottom), selection = [B, A]
  await page.keyboard.press('Control+g'); // group = [A, B]

  await designPage.pointerDown(1408, 370); // grab A's own area, off dead-centre to clear the swap handle
  await page.mouse.move(650, 300, { steps: 10 });
  await page.waitForTimeout(150);
  await designPage.pointerUp();

  // C, dragged in well past the group, becomes the second member
  await designPage.drawRectangle(1400, 500, 1450, 550);
  await designPage.pointerDown(1420, 525);
  await page.mouse.move(950, 300, { steps: 10 });
  await page.waitForTimeout(150);
  await designPage.pointerUp();

  const before = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];
    const [frameId] = activePage.rootOrder;
    const frame = activePage.nodes[frameId] as { childIds: string[] };
    const [groupId, cId] = frame.childIds;
    const group = activePage.nodes[groupId] as { childIds: string[]; width: number };
    const children = group.childIds
      .map((id) => activePage.nodes[id] as { height: number; id: string; width: number; x: number; y: number })
      .sort((a, b) => a.x - b.x);
    const c = activePage.nodes[cId] as { x: number };

    return { cId, cX: c.x, children, frameId, groupId, groupWidth: group.width };
  });

  // select the group directly — a plain canvas click on one of its children selects that leaf
  // itself (not the group) once the group is a member of an auto-layout frame, so drive the
  // selection through the store the same way the Layers-tree row click does
  await page.evaluate(async (groupId) => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');

    store.dispatch(setSelection([groupId]));
  }, before.groupId);

  const [leftBefore, rightBefore] = before.children;
  const gapMidX = (leftBefore.x + leftBefore.width + rightBefore.x) / 2;
  const gapMidY = leftBefore.y + leftBefore.height / 2;
  const growBy = 30;

  await designPage.pointerMove(gapMidX, gapMidY);
  await designPage.pointerDown(gapMidX, gapMidY);
  await page.mouse.move(gapMidX + growBy, gapMidY, { steps: 5 });
  await page.waitForTimeout(100);

  // read while the gap handle is still held — the frame must have ALREADY reacted, mid-drag
  const midDrag = await page.evaluate(
    async ({ cId, groupId }) => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];

      return {
        cX: (activePage.nodes[cId] as { x: number }).x,
        groupWidth: (activePage.nodes[groupId] as { width: number }).width,
      };
    },
    { cId: before.cId, groupId: before.groupId },
  );

  await designPage.pointerUp();

  // the group widened (its far child pushed by 2x the pointer's own move), and the frame reacted —
  // 'C' slid over to keep sitting right after the now-wider group, instead of staying frozen in place
  expect(midDrag.groupWidth).toBeGreaterThan(before.groupWidth);
  expect(midDrag.cX).toBeGreaterThan(before.cX);
});

test('the Smart Selection swap handle reorders the children of a selected group', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-smart-selection-group-swap');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 750, 350); // A
  await designPage.drawRectangle(800, 300, 850, 350); // B
  await designPage.click(720, 320, { shift: true });
  await page.keyboard.press('Control+g');

  const before = await readActivePage(designPage.page);
  const [leftBefore, rightBefore] = before.children;
  const leftCenter = { x: leftBefore.x + leftBefore.width / 2, y: leftBefore.y + 25 };
  const rightCenter = { x: rightBefore.x + rightBefore.width / 2, y: rightBefore.y + 25 };

  await designPage.pointerMove(leftCenter.x, leftCenter.y);
  await designPage.pointerDown(leftCenter.x, leftCenter.y);
  await page.mouse.move(rightCenter.x, rightCenter.y, { steps: 6 });
  await designPage.pointerUp();

  const after = await readActivePage(designPage.page);
  const swapped = after.children.find((child) => child.id === leftBefore.id);

  // the formerly-left child now sits in the formerly-right slot
  expect(swapped?.x).toBe(rightBefore.x);
  // and the group box is unchanged — same union of the same two rects
  expect(after.group.x).toBe(before.group.x);
  expect(after.group.width).toBe(before.group.width);
});
