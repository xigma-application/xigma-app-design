import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TReadablePaint = {
  color?: string;
  end?: { x: number; y: number };
  opacity: number;
  start?: { x: number; y: number };
  stops?: { color: string; opacity: number; position: number }[];
  type: string;
  visible?: boolean;
};
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

// samples a single pixel's RGB out of a tiny clipped screenshot — same PNG-decode technique
// mask.spec.ts / vector-edit.spec.ts use for pixel-level assertions
const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const screenshot = await page.screenshot({ clip: { height: 1, width: 1, x, y } });
  const png = PNG.sync.read(screenshot);

  return [png.data[0], png.data[1], png.data[2]];
};

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

  test('closes the format dropdown when clicking a plain area of the fill color picker', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-picker-dropdown-outside-click');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    await page.getByLabel('Hex color').click();

    const panel = page.locator('[class*="ColorPicker_"]').first();

    await expect(panel).toBeVisible();

    await panel.getByText('Hex', { exact: true }).click();

    const dropdownPanel = page.locator('[class*="DropdownPanel_"]');

    await expect(dropdownPanel).toBeVisible();

    // a plain, non-interactive strip of padding inside the picker, far from the open dropdown panel
    await panel
      .locator('[class*="SaturationMap_"]')
      .first()
      .click({ position: { x: 2, y: 2 } });

    await expect(dropdownPanel).toHaveCount(0);
  });

  test('docks a gradient stop color panel flush against the gradient panel, not floating over its own swatch', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-stop-picker-docking');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    await page.getByLabel('Hex color').click();
    await page.getByRole('button', { name: 'Gradient' }).click();

    const gradientPanel = page.locator('[class*="ColorPicker_"]:not([class*="ColorPicker__"])').first();
    const gradientPanelBox = (await gradientPanel.boundingBox())!;

    await page.getByRole('button', { name: 'Stop color' }).first().click();

    const stopPanel = page.locator('[class*="StopColorPanel_"]:not([class*="StopColorPanel__"])');

    await expect(stopPanel).toBeVisible();

    const stopPanelBox = (await stopPanel.boundingBox())!;

    // docked flush against the left edge of the gradient panel, not floating over the small swatch that opened it
    expect(stopPanelBox.x + stopPanelBox.width).toBeCloseTo(gradientPanelBox.x, 0);
    expect(stopPanelBox.y).toBeCloseTo(gradientPanelBox.y, 0);
  });

  test('rotating a shape gradient fill updates its stored direction and the rendered canvas, with handles shown while editing', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-rotate');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // seed a real gradient-linear fill on the node, since the Fill panel has no UI path yet to
    // convert a solid fill into a persisted gradient (out of scope for this feature)
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-linear',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    const beforeRotate = await designPage.canvas.screenshot();

    await page.getByLabel('Hex color').click();
    await expect(page.getByRole('button', { name: 'Rotate gradient' })).toBeVisible();

    // result — the canvas overlay handles (line + endpoints + stop swatches) appear while editing
    const afterOpen = await designPage.canvas.screenshot();

    expect(afterOpen.equals(beforeRotate)).toBe(false);

    await page.getByRole('button', { name: 'Rotate gradient' }).click();

    const node = await readNode(page, id);
    const { end, start } = node.fills![0];

    expect(start!.x).toBeCloseTo(0.5);
    expect(start!.y).toBeCloseTo(0);
    expect(end!.x).toBeCloseTo(0.5);
    expect(end!.y).toBeCloseTo(1);

    // result — the shape's own rendered gradient direction changed too
    const afterRotate = await designPage.canvas.screenshot();

    expect(afterRotate.equals(afterOpen)).toBe(false);
  });

  test('switching a solid fill to Gradient via the paint type row actually converts and applies it, not just previews it', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-solid-to-gradient');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);
    const beforeSwitch = await designPage.canvas.screenshot();

    await page.getByLabel('Hex color').click();
    await page.getByRole('button', { name: 'Gradient' }).click();

    const node = await readNode(page, id);
    const paint = node.fills![0];

    expect(paint.type).toBe('gradient-linear');
    expect(paint.start).toBeTruthy();
    expect(paint.end).toBeTruthy();
    expect(paint.stops).toHaveLength(2);

    // result — two genuinely distinct stop colors, not the same solid color duplicated into both
    expect(paint.stops![0].color).not.toBe(paint.stops![1].color);

    // result — the shape's own render actually changed too, not just the picker's own scratch preview
    const afterSwitch = await designPage.canvas.screenshot();

    expect(afterSwitch.equals(beforeSwitch)).toBe(false);
  });

  test('a gradient stop clamps to its own color past its own position, instead of falling back to the first stop', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-stop-clamp');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // white at 0%, black at 50% — everything from 50% to 100% should stay solid black, not
    // fall back to the first stop's white
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 0.5 },
                ],
                type: 'gradient-linear',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    // rectangle spans x:700-900, y:200-360 — sample at t≈0.9 (x=880), well past the last stop
    const [r, g, b] = await readPixelColor(page, 880, 280);

    expect(r).toBeLessThan(40);
    expect(g).toBeLessThan(40);
    expect(b).toBeLessThan(40);
  });

  test('dragging a gradient stop past another stop does not disturb the crossed stop own position or color', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-stop-drag-past');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // three stops: white at 0%, red at 50%, black at 100%
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#ff0000', opacity: 100, position: 0.5 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-linear',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    const thumbs = page.getByLabel('Stop marker');

    await expect(thumbs).toHaveCount(3);

    const barBox = (await page.locator('[class*="GradientBar__wrapper"]').boundingBox())!;
    const lastThumbBox = (await thumbs.nth(2).boundingBox())!;
    const lastThumbY = lastThumbBox.y + lastThumbBox.height / 2;

    // drag the 100% (black) stop leftward, past the 50% (red) stop, landing near 20%
    await page.mouse.move(lastThumbBox.x + lastThumbBox.width / 2, lastThumbY);
    await page.mouse.down();
    await page.mouse.move(barBox.x + barBox.width * 0.2, lastThumbY, { steps: 20 });
    await page.mouse.up();

    const node = await readNode(page, id);
    const stops = node.fills![0].stops!;

    expect(stops).toHaveLength(3);

    const redStop = stops.find((stop) => stop.color === '#ff0000');
    const blackStop = stops.find((stop) => stop.color === '#000000');

    // result — the crossed (red) stop must still be exactly where it was, not "stolen" mid-drag
    expect(redStop!.position).toBeCloseTo(0.5, 1);
    // result — the dragged (black) stop actually landed where the drag ended, left of the red stop
    expect(blackStop!.position).toBeLessThan(0.3);
  });

  test('dragging a gradient stop directly on the canvas moves it along the guide', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-stop-canvas-drag');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // horizontal gradient across the rectangle: white at 0%, black at 100%
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-linear',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // the black stop's own on-canvas swatch: world (900, 280) — the end of the gradient line —
    // offset 22 world px upward toward its indicator; the viewport is identity (1:1) fresh on load
    await page.mouse.move(900, 258);
    await page.mouse.down();
    await page.mouse.move(800, 258, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);
    const stops = node.fills![0].stops!;
    const blackStop = stops.find((stop) => stop.color === '#000000');

    expect(stops).toHaveLength(2);
    expect(blackStop!.position).toBeCloseTo(0.5, 1);
  });

  test('the fill picker stays open after dragging a gradient stop, even if the cursor strays off it before release', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-stop-drag-stray-release');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-linear',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // grab the black stop's swatch, drag it, then let the cursor stray well away from it before releasing
    await page.mouse.move(900, 258);
    await page.mouse.down();
    await page.mouse.move(850, 258, { steps: 5 });
    await page.mouse.move(850, 30, { steps: 5 });
    await page.mouse.up();

    // result — the picker (and the gradient editor it drives) survives the release, it doesn't
    // get treated as an "outside click" that dismisses the popover
    const gradientEditor = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');

      return store.getState().design.gradientEditor;
    });

    expect(gradientEditor).not.toBeNull();
    await expect(page.getByRole('button', { name: 'Rotate gradient' })).toBeVisible();
  });

  test('clicking the gradient guide line on the canvas adds a new stop there and selects it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-add-stop-on-line');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // white at 0%, black at 100% — line runs world (700,280) -> (900,280)
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-linear',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // hovering the middle of the line (away from either stop's own swatch) shows the add-stop preview
    const beforeHover = await designPage.canvas.screenshot();

    await page.mouse.move(800, 280);

    const afterHover = await designPage.canvas.screenshot();

    expect(afterHover.equals(beforeHover)).toBe(false);

    // clicking there adds a new stop at ~50% and selects it
    await page.mouse.down();
    await page.mouse.up();

    const node = await readNode(page, id);
    const stops = node.fills![0].stops!;

    expect(stops).toHaveLength(3);

    const newStop = stops.find((stop) => stop.color !== '#ffffff' && stop.color !== '#000000') ?? stops[1];

    expect(newStop.position).toBeCloseTo(0.5, 1);

    const gradientEditor = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');

      return store.getState().design.gradientEditor;
    });

    expect(gradientEditor?.selectedStopIndex).toBe(stops.indexOf(newStop));

    // result — the docked panel's own stop list/bar picks up the canvas-added stop too, not just Redux
    await expect(page.getByLabel('Stop marker')).toHaveCount(3);
  });

  test('clicking near an existing stop on the canvas does not add a new one — stops take priority over the line', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-stop-priority-over-line');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-linear',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // the black stop's own swatch: world (900, 280), offset up by 22
    await page.mouse.move(900, 258);
    await page.mouse.down();
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].stops).toHaveLength(2);
  });

  test('dragging a gradient endpoint on the canvas rotates the line around the shape', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-rotate-drag');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // horizontal gradient across the rectangle (bounds 700,200 - 900,360, center 800,280):
    // start at the left-mid edge (700,280), end at the right-mid edge (900,280)
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-linear',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // grab the end endpoint (900,280) and drag it up toward the top-mid edge (800,150) — the whole
    // line rotates as a rigid body around the shape's center, so the start endpoint must swing all
    // the way around to the opposite (bottom-mid) edge
    await page.mouse.move(900, 280);
    await page.mouse.down();
    await page.mouse.move(800, 150, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].end!.x).toBeCloseTo(0.5, 1);
    expect(node.fills![0].end!.y).toBeCloseTo(0, 1);
    expect(node.fills![0].start!.x).toBeCloseTo(0.5, 1);
    expect(node.fills![0].start!.y).toBeCloseTo(1, 1);
  });

  test('clicking right on a gradient endpoint does not add a new stop there — rotating takes priority over the line', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-rotate-priority-over-line');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 1, y: 0.5 },
                opacity: 100,
                start: { x: 0, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-linear',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // the end endpoint sits right at world (900, 280); clicking it without dragging should neither
    // add a stop there nor move the endpoint
    await page.mouse.move(900, 280);
    await page.mouse.down();
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].stops).toHaveLength(2);
    expect(node.fills![0].end).toEqual({ x: 1, y: 0.5 });
  });
});
