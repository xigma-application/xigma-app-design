import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TSectionState = { fills: { color?: string }[]; height: number; type: string; width: number; x: number; y: number };

const EMPTY_POINT = { x: 1500, y: 900 };
const LABEL_POINT = { x: 703, y: 280 };

const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const screenshot = await page.screenshot({ clip: { height: 1, width: 1, x, y } });
  const png = PNG.sync.read(screenshot);

  return [png.data[0], png.data[1], png.data[2]];
};

const isColor = (actual: [number, number, number], expected: [number, number, number]): boolean =>
  actual.every((channel, index) => Math.abs(channel - expected[index]) <= 2);

const readLastNode = (page: Page): Promise<TSectionState> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return nodes[rootOrder[rootOrder.length - 1]] as unknown as TSectionState;
  });

const deselect = async (designPage: DesignPage): Promise<void> => {
  await designPage.click(EMPTY_POINT.x, EMPTY_POINT.y);
  await designPage.pointerMove(EMPTY_POINT.x, EMPTY_POINT.y);
};

test('a selected section shows the Section panel without rotation, and its fill edits recolor the section and its label', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-panel-fill');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSection(700, 300, 1000, 600);

  await expect(page.locator('[data-test-component-header="section"]').getByText('Section', { exact: true })).toBeVisible();
  await expect(page.getByText('Rotation', { exact: true })).toHaveCount(0);

  const hexInput = page.getByLabel('Hex color').locator('..').getByRole('textbox').first();

  await hexInput.fill('FFFFFF');
  await hexInput.press('Enter');

  expect((await readLastNode(page)).fills[0].color).toBe('#ffffff');

  await deselect(designPage);

  await expect.poll(async () => isColor(await readPixelColor(page, 850, 450), [0xff, 0xff, 0xff])).toBe(true);
  await expect.poll(async () => isColor(await readPixelColor(page, LABEL_POINT.x, LABEL_POINT.y), [0xff, 0xff, 0xff])).toBe(true);
});

test('a section without a solid fill gets a label that follows the page background', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-panel-label-page');
  await expect(designPage.canvas).toBeVisible();

  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
  });

  await designPage.drawSection(700, 300, 1000, 600);
  await page.getByLabel('Delete fill').click();

  expect((await readLastNode(page)).fills).toEqual([]);

  await deselect(designPage);

  await expect.poll(async () => isColor(await readPixelColor(page, LABEL_POINT.x, LABEL_POINT.y), [0x44, 0x44, 0x44])).toBe(true);

  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'light';
  });

  await expect.poll(async () => isColor(await readPixelColor(page, LABEL_POINT.x, LABEL_POINT.y), [0xff, 0xff, 0xff])).toBe(true);
});

test('Resize to fit in the Section Layout header shrinks the section to its children', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-panel-resize-to-fit');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(800, 400, 900, 500);
  await deselect(designPage);
  await designPage.drawSection(700, 300, 1100, 700);

  await page.getByLabel('Resize to fit', { exact: true }).click();

  expect(await readLastNode(page)).toMatchObject({ height: 100, type: 'section', width: 100 });
});

test('picking Frame in the Section header menu turns the section into a frame', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-panel-frame');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSection(700, 300, 1000, 600);

  await page.getByLabel('Element type', { exact: true }).click();
  await page.getByText('Frame', { exact: true }).click();

  await expect(page.locator('[data-test-component-header="frame"]')).toBeVisible();
  expect((await readLastNode(page)).type).toBe('frame');
});

test('Align left on a section with children moves every child to the section’s left edge', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-panel-align-children');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(800, 400, 850, 450);
  await deselect(designPage);
  await designPage.drawRectangle(900, 500, 980, 560);
  await deselect(designPage);
  await designPage.drawSection(700, 300, 1100, 700);

  await page.getByLabel('Align left', { exact: true }).click();

  const { children, section } = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const sectionNode = nodes[rootOrder[rootOrder.length - 1]] as unknown as { childIds: string[]; x: number };

    return { children: sectionNode.childIds.map((id) => (nodes[id] as unknown as { x: number }).x), section: sectionNode.x };
  });

  expect(children).toEqual([section, section]);
});

test('several selected sections show Wrap in new section and Resize to fit fits each one to its own children', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-panel-multi');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(600, 400, 650, 450);
  await deselect(designPage);
  await designPage.drawSection(550, 350, 700, 500);
  await deselect(designPage);
  await designPage.drawRectangle(900, 400, 960, 470);
  await deselect(designPage);
  await designPage.drawSection(850, 350, 1050, 550);

  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { setSelection } = await import('/src/store/design/slice.ts');
    const { activePageId, pages } = store.getState().design;

    store.dispatch(setSelection(pages[activePageId].rootOrder));
  });

  await expect(page.getByLabel('Wrap in new section', { exact: true })).toBeVisible();

  await page.getByLabel('Resize to fit', { exact: true }).click();

  const sizes = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];

    return rootOrder.map((id) => {
      const node = nodes[id] as unknown as { height: number; width: number };

      return { height: node.height, width: node.width };
    });
  });

  expect(sizes).toEqual([
    { height: 50, width: 50 },
    { height: 70, width: 60 },
  ]);
});

test('a section inside a section shows its label inside its top-left corner, above its children, and a click there selects it', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-panel-nested-label');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(605, 355, 800, 500);
  await deselect(designPage);
  await designPage.drawSection(600, 350, 1000, 700);
  await deselect(designPage);
  await designPage.drawSection(500, 250, 1300, 850);
  await deselect(designPage);

  const innerId = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes } = pages[activePageId];
    const inner = Object.values(nodes).find((node) => node.type === 'section' && node.parentId !== null);

    return inner && 'childIds' in inner && inner.childIds.length === 1 ? inner.id : null;
  });

  expect(innerId).not.toBeNull();

  await designPage.click(625, 370);

  const selectedIds = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

  expect(selectedIds).toEqual([innerId]);
});
