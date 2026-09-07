import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// an outer frame drawn well clear of the LeftPanel/RightPanel overlays, with room to its right to
// draw and drag in children from outside its own bounds — mirrors fill-sizing.spec.ts's own layout
const OUTER = { x1: 600, x2: 900, y1: 150, y2: 350 };

const flowGroup = (page: Page): ReturnType<Page['locator']> => page.locator('[data-test-toggle-button-group="flow"]');

const setFlowHorizontal = async (page: Page): Promise<void> => {
  await flowGroup(page).getByLabel('Horizontal', { exact: true }).click();
};

// mirrors gap-handles.spec.ts's own drop-settle wait, so the live auto-layout drop indicator has
// resolved to its final insertion index before the drop is released
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

const readOuterFrame = (page: Page): Promise<{ childIds: string[]; width: number }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return activePage.nodes[activePage.rootOrder[0]] as { childIds: string[]; width: number };
  });

const readChildPosition = (page: Page, childId: string): Promise<{ width: number; x: number; y: number }> =>
  page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;
    const activePage = pages[activePageId];

    return activePage.nodes[id] as { width: number; x: number; y: number };
  }, childId);

test.describe('auto-layout — Min/Max sizing', () => {
  test('a maxWidth clamps a Hug frame, and once Wrap is on it re-hugs to the widest wrapped line instead', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-auto-layout-min-max-sizing');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(OUTER.x1, OUTER.y1, OUTER.x2, OUTER.y2); // auto-selected
    await expect(flowGroup(page)).toBeVisible();
    await setFlowHorizontal(page);

    // two 100x50 rectangles, dragged in from outside the frame — their combined natural width (200)
    // exceeds the 150 maxWidth this test sets below
    await designPage.drawRectangle(1400, 160, 1500, 210);
    await dragInto(page, { x: 1450, y: 185 }, { x: 700, y: 250 });
    await designPage.drawRectangle(1400, 300, 1500, 350);
    await dragInto(page, { x: 1450, y: 325 }, { x: 700, y: 250 });

    // re-select the outer frame — dragging a child into it leaves the child itself selected
    await selectLayersRow(page, 'Frame (1)');

    // switch the frame's own width to Hug, then attach a Max width bound
    await page.getByLabel('Width sizing options').click();
    await page.getByText('Hug contents', { exact: true }).click();
    await page.getByLabel('Width sizing options').click();
    await page.getByText('Add max width…', { exact: true }).click();

    const maxWidthInput = page.locator('[data-test-text-field-input="max-width"]');

    await maxWidthInput.click();
    await maxWidthInput.fill('150');
    await maxWidthInput.press('Enter');

    const afterMax = await readOuterFrame(page);

    // the frame's natural hugged width (200) is clamped down to the 150 max
    expect(afterMax.width).toBe(150);

    const [firstChildId, secondChildId] = afterMax.childIds;

    // turning Wrap on makes the bounded Hug group children against the 150 budget instead: the
    // second rectangle no longer fits next to the first, so it spills onto its own line, and the
    // frame re-hugs down to the widest single line (100) rather than staying pinned at the max
    await page.getByLabel('Wrap', { exact: true }).click();

    const afterWrap = await readOuterFrame(page);
    const firstChild = await readChildPosition(page, firstChildId);
    const secondChild = await readChildPosition(page, secondChildId);

    expect(afterWrap.width).toBe(100);
    expect(secondChild.y).toBeGreaterThan(firstChild.y);
    expect(secondChild.x).toBe(firstChild.x);
  });
});
