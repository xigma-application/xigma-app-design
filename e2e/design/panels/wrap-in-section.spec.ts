import { Page, test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TBox = { height: number; width: number; x: number; y: number };

const readSectionAndChildren = (page: Page): Promise<{ children: TBox[]; section: (TBox & { type: string }) | null }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, rootOrder } = pages[activePageId];
    const sectionId = rootOrder.find((id) => nodes[id].type === 'section');
    const toBox = (id: string): TBox => {
      const { height, width, x, y } = nodes[id] as unknown as TBox;

      return { height, width, x, y };
    };

    if (!sectionId) {
      return { children: [], section: null };
    }

    return {
      children: (nodes[sectionId] as unknown as { childIds: string[] }).childIds.map(toBox),
      section: { ...toBox(sectionId), type: nodes[sectionId].type },
    };
  });

const expectSectionAroundChildren = async (page: Page): Promise<void> => {
  const { children, section } = await readSectionAndChildren(page);
  const left = Math.min(...children.map(({ x }) => x));
  const top = Math.min(...children.map(({ y }) => y));
  const right = Math.max(...children.map(({ width, x }) => x + width));
  const bottom = Math.max(...children.map(({ height, y }) => y + height));

  expect(children).toHaveLength(2);
  expect(section).toEqual({ height: bottom - top + 50, type: 'section', width: right - left + 50, x: left - 25, y: top - 25 });
};

test('Wrap in new section wraps two selected frames in a section 25px larger than them on every side', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-wrap-in-section');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(700, 200, 800, 300);
  await designPage.drawFrame(900, 250, 1000, 350);
  await designPage.click(750, 250, { shift: true });

  await page.getByLabel('Wrap in new section', { exact: true }).click();

  await expectSectionAroundChildren(page);
});

test('Ctrl+S wraps the selected layers in a new section', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-wrap-in-section-shortcut');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 200, 800, 300);
  await designPage.drawRectangle(900, 250, 1000, 350);
  await designPage.click(750, 250, { shift: true });
  await page.keyboard.press('Control+s');

  await expectSectionAroundChildren(page);
});

test('layers inside a frame have no Wrap in new section option and Ctrl+S leaves them in place', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-wrap-in-section-nested');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(600, 150, 1100, 450);
  await designPage.drawFrame(700, 200, 800, 300);
  await designPage.drawFrame(900, 250, 1000, 350);
  await designPage.click(750, 250, { shift: true });

  await expect(page.locator('[data-test-component-header="frame"]')).toBeVisible();
  await expect(page.getByLabel('Wrap in new section', { exact: true })).toHaveCount(0);

  await page.keyboard.press('Control+s');

  expect((await readSectionAndChildren(page)).section).toBeNull();
});

const readParentIds = (page: Page): Promise<Record<string, string | null>> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return Object.fromEntries(Object.values(pages[activePageId].nodes).map((node) => [node.name, node.parentId]));
  });

test('a section drawn on top of a section and a section dragged onto a section both land inside it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-section-in-section');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawSection(500, 150, 1100, 600);
  await designPage.drawSection(600, 250, 700, 350);
  await designPage.drawSection(1200, 250, 1300, 350);
  await designPage.pointerDown(1250, 300);
  await designPage.pointerMove(1100, 300);
  await designPage.pointerMove(900, 400);
  await designPage.pointerUp();

  const parentIds = await readParentIds(page);
  const outerId = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].rootOrder[0];
  });

  expect(parentIds).toEqual({ 'Section (1)': null, 'Section (2)': outerId, 'Section (3)': outerId });
});

test('Wrap in new section on layers inside a section nests the new section in it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-wrap-in-section-inside-section');
  await expect(designPage.canvas).toBeVisible();

  await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { addNodes, setSelection } = await import('/src/store/design/slice.ts');
    const rectangle = (id: string, x: number): object => ({
      fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
      height: 50,
      id,
      name: id,
      parentId: 'outer',
      rotation: 0,
      type: 'rectangle',
      width: 50,
      x,
      y: 300,
    });

    store.dispatch(
      addNodes({
        nodes: [
          {
            childIds: ['a', 'b'],
            fill: '#444444',
            height: 400,
            id: 'outer',
            name: 'outer',
            parentId: null,
            rotation: 0,
            type: 'section',
            width: 600,
            x: 500,
            y: 150,
          },
          rectangle('a', 600),
          rectangle('b', 800),
        ],
        rootIds: ['outer'],
      } as never),
    );
    store.dispatch(setSelection(['a', 'b']));
  });

  await page.keyboard.press('Control+s');

  const wrapped = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const { nodes, selectedIds } = pages[activePageId];
    const section = nodes[selectedIds[0]] as unknown as {
      childIds: string[];
      height: number;
      parentId: string;
      type: string;
      width: number;
      x: number;
      y: number;
    };

    return {
      childIds: section.childIds,
      height: section.height,
      parentId: section.parentId,
      type: section.type,
      width: section.width,
      x: section.x,
      y: section.y,
    };
  });

  expect(wrapped).toEqual({ childIds: ['a', 'b'], height: 100, parentId: 'outer', type: 'section', width: 300, x: 575, y: 275 });
});

test('a frame inside a frame gets a disabled Section option in its header menu and stays a frame when it is clicked', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-frame-in-frame-section-option');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawFrame(600, 150, 1100, 450);
  await designPage.drawFrame(700, 200, 800, 300);

  await page.getByLabel('Element type', { exact: true }).click();
  await page.getByText('Section', { exact: true }).click();

  const types = await page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return Object.values(pages[activePageId].nodes).map((node) => node.type);
  });

  expect(types).toEqual(['frame', 'frame']);
});
