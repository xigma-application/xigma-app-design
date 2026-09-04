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
