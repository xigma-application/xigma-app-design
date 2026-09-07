import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// an outer frame drawn well clear of the LeftPanel/RightPanel overlays, with room to its right to
// draw and drag in children from outside its own bounds — mirrors flow.spec.ts's own layout
const OUTER = { x1: 600, x2: 1100, y1: 150, y2: 650 };

const flowGroup = (page: Page): ReturnType<Page['locator']> => page.locator('[data-test-toggle-button-group="flow"]');

const setFlow = async (page: Page, direction: 'Horizontal' | 'Vertical'): Promise<void> => {
  await flowGroup(page).getByLabel(direction, { exact: true }).click();
};

// mirrors flow.spec.ts's own drop-settle wait, so the live auto-layout drop indicator has resolved
// to its final insertion index before the drop is released
const dragInto = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
};

const selectLayersRow = async (page: Page, exactName: string): Promise<void> => {
  await page.locator('[class*="Tree__row_"]').filter({ hasText: exactName }).first().click();
};

test.describe('auto-layout — Fill container sizing', () => {
  test('selecting Fill for a child frame in the RightPanel grows it into the leftover space, and it keeps growing as the parent is resized', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-fill-sizing');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(OUTER.x1, OUTER.y1, OUTER.x2, OUTER.y2); // 500x500, auto-selected
    await expect(flowGroup(page)).toBeVisible();
    await setFlow(page, 'Horizontal');

    // first child: a fixed 100-wide rectangle, dragged in from outside the frame
    await designPage.drawRectangle(1400, 160, 1500, 260);
    await dragInto(page, { x: 1450, y: 210 }, { x: 700, y: 300 });

    // second child: a plain (freeForm) 80x80 frame, also dragged in — a frame child can be selected
    // in its own right, which is what unlocks the RightPanel's sizing dropdown for it
    await designPage.drawFrame(1400, 300, 1480, 380);
    await dragInto(page, { x: 1440, y: 340 }, { x: 700, y: 300 });

    // select the inner frame (named "Frame (2)" — the outer frame took "Frame (1)") and switch its
    // width to Fill via the RightPanel's own width sizing-mode dropdown
    await selectLayersRow(page, 'Frame (2)');
    await page.getByLabel('Width sizing options').click();
    await page.getByText('Fill container', { exact: true }).click();

    const afterFill = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const outer = activePage.nodes[activePage.rootOrder[0]] as { childIds: string[] };
      const [rectId, frameId] = outer.childIds;

      return {
        frame: activePage.nodes[frameId] as { width: number; widthSizingMode?: string },
        rect: activePage.nodes[rectId] as { width: number },
      };
    });

    // leftover = 500 (outer content box) - 100 (fixed rectangle) - 0 (default gap) = 400
    expect(afterFill.frame.widthSizingMode).toBe('fill');
    expect(afterFill.frame.width).toBe(400);
    expect(afterFill.rect.width).toBe(100);

    // grow the outer frame from 500 to 700 wide via its own east resize handle — the filling child
    // must live-regrow to keep consuming the leftover space, while the fixed sibling stays put
    await selectLayersRow(page, 'Frame (1)');
    const outerMidY = (OUTER.y1 + OUTER.y2) / 2;

    await designPage.pointerDown(OUTER.x2, outerMidY);
    await designPage.pointerMove(OUTER.x2 + 200, outerMidY);
    await page.waitForTimeout(150);
    await designPage.pointerUp();

    const afterResize = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;
      const activePage = pages[activePageId];
      const outer = activePage.nodes[activePage.rootOrder[0]] as { childIds: string[]; width: number };
      const [rectId, frameId] = outer.childIds;

      return {
        frame: activePage.nodes[frameId] as { width: number },
        outerWidth: outer.width,
        rect: activePage.nodes[rectId] as { width: number },
      };
    });

    expect(afterResize.outerWidth).toBe(700);
    expect(afterResize.frame.width).toBe(600);
    expect(afterResize.rect.width).toBe(100);
  });
});
