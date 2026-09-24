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
