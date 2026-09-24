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
