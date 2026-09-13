import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TReadablePaint = { color?: string; opacity: number; type: string; visible?: boolean };
type TReadableNode = { fills?: TReadablePaint[] };

const readFirstNodeId = (page: Page): Promise<string> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].rootOrder[0];
  });

const readNode = (page: Page, id: string): Promise<TReadableNode> =>
  page.evaluate(async (nodeId) => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes[nodeId] as TReadableNode;
  }, id);

test.describe('Design panels — Fill section', () => {
  test('adding a fill stacks a second solid layer on top and changes the render', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-add');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);
    const before = await designPage.canvas.screenshot();

    await page.getByLabel('Add fill').click();

    const node = await readNode(page, id);

    expect(node.fills).toHaveLength(2);

    const after = await designPage.canvas.screenshot();

    expect(after.equals(before)).toBe(false);
  });

  test('deleting every fill leaves the shape with none and clears the render', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-delete-all');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Delete fill').click();

    expect((await readNode(page, id)).fills).toEqual([]);
  });

  test('typing a hex value commits it onto the fill and changes the render', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-hex');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);
    const before = await designPage.canvas.screenshot();
    const hexInput = page.getByLabel('Hex color').locator('..').getByRole('textbox').first();

    await hexInput.fill('00ff00');
    await hexInput.press('Enter');

    expect((await readNode(page, id)).fills?.[0].color).toBe('#00ff00');

    const after = await designPage.canvas.screenshot();

    expect(after.equals(before)).toBe(false);
  });

  test('hiding a fill via the eye toggle stops it from rendering without removing it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-hide');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);
    const before = await designPage.canvas.screenshot();

    await page.getByLabel('Hide fill').click();

    const node = await readNode(page, id);

    expect(node.fills).toHaveLength(1);
    expect(node.fills?.[0].visible).toBe(false);

    const after = await designPage.canvas.screenshot();

    expect(after.equals(before)).toBe(false);
    await expect(page.getByLabel('Show fill')).toBeVisible();
  });

  test('dragging a fill row past another reorders the stack, showing a drop indicator and a selected handle mid-drag', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-reorder');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);
    await page.getByLabel('Add fill').click();

    const secondHexInput = page.getByLabel('Hex color').locator('..').getByRole('textbox').nth(1);

    await secondHexInput.fill('00ff00');
    await secondHexInput.press('Enter');

    const id = await readFirstNodeId(page);
    const handles = page.getByLabel('Reorder fill');
    const fromBox = (await handles.nth(0).boundingBox())!;
    const toBox = (await handles.nth(1).boundingBox())!;

    await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height, { steps: 10 });

    // result — a drop indicator shows where the row will land while the drag is in progress
    await expect(page.locator('[class*="FillDropIndicator"]')).toBeVisible();

    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills?.map((paint) => paint.color)).toEqual(['#00ff00', '#D9D9D9']);
  });

  test('clicking a fill row selects it, and clicking outside the fill list clears the selection', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-select');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const row = page.locator('[class*="FillRow_"]').first();
    const rowBox = (await row.boundingBox())!;

    // click the row's own left padding strip — everything else is covered by the color/hex/opacity
    // controls, which stop the click from bubbling up into row selection
    await page.mouse.click(rowBox.x + 2, rowBox.y + rowBox.height / 2);

    await expect(row).toHaveClass(/FillRow--selected/);

    // click back on the still-selected rectangle itself — outside the fill rows, but not a deselect
    await designPage.canvas.click({ position: { x: 800, y: 280 } });

    await expect(row).not.toHaveClass(/FillRow--selected/);
  });
});
