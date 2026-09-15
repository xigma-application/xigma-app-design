import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TReadablePaint = {
  alignmentIndex?: number;
  color?: string;
  direction?: string;
  end?: { x: number; y: number };
  opacity: number;
  scale?: number;
  sourceNodeId?: string | null;
  spacingX?: number;
  spacingY?: number;
  start?: { x: number; y: number };
  stops?: { color: string; opacity: number; position: number }[];
  tileType?: string;
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

    // grab 8px below the end endpoint (900,280) — past its inner 6px move zone, inside the outer
    // rotate ring — and drag toward the top-mid edge (800,150); the whole line rotates as a rigid
    // body around the shape's center, so the start endpoint must swing all the way around to the
    // opposite (bottom-mid) edge
    await page.mouse.move(900, 288);
    await page.mouse.down();
    await page.mouse.move(800, 150, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].end!.x).toBeCloseTo(0.5, 1);
    expect(node.fills![0].end!.y).toBeCloseTo(0, 1);
    expect(node.fills![0].start!.x).toBeCloseTo(0.5, 1);
    expect(node.fills![0].start!.y).toBeCloseTo(1, 1);
  });

  test('clicking right on a gradient endpoint does not add a new stop there — the endpoint takes priority over the line', async ({
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

  test('rotating a gradient whose endpoints do not touch the shape edge pivots around its own center, not the shape', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-rotate-line-mode');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // bounds 700,200 - 900,360 (center 800,280); a short gradient fully inside the shape,
    // touching neither edge: start world (760,280), end world (840,296) — pivot (800,288), radius ~40.8
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 0.7, y: 0.6 },
                opacity: 100,
                start: { x: 0.3, y: 0.5 },
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

    // grab 8px below the start endpoint (760,280) — past its inner move zone — and drag it well off
    // any snap axis relative to the pivot
    await page.mouse.move(760, 288);
    await page.mouse.down();
    await page.mouse.move(850, 250, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);
    const pivot = { x: 800, y: 288 };
    const radius = Math.hypot(80, 16) / 2;
    const startWorld = { x: 700 + node.fills![0].start!.x * 200, y: 200 + node.fills![0].start!.y * 160 };
    const endWorld = { x: 700 + node.fills![0].end!.x * 200, y: 200 + node.fills![0].end!.y * 160 };

    // both endpoints stay exactly the original half-length away from the pivot — a box-mode rotate
    // would instead snap them onto the rectangle's own edge, at very different distances
    expect(Math.hypot(startWorld.x - pivot.x, startWorld.y - pivot.y)).toBeCloseTo(radius, 0);
    expect(Math.hypot(endWorld.x - pivot.x, endWorld.y - pivot.y)).toBeCloseTo(radius, 0);
  });

  test('rotating a gradient whose endpoints both touch the same single edge also pivots around the line, not the box', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-rotate-same-edge');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // bounds 700,200 - 900,360 (center 800,280); both endpoints sit only on the TOP edge, at
    // different x — a real regression: sharing one edge (with no distinct wall each) was wrongly
    // treated the same as spanning two different edges, forcing the line through the box center on
    // the very next rotate frame and making the far endpoint visibly "jump"
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 0.8, y: 0 },
                opacity: 100,
                start: { x: 0.2, y: 0 },
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

    // grab 8px below the start endpoint (740,200) — past its inner move zone — and drag it a short,
    // gentle distance; a box-center pivot would immediately force the line through (800,280) and
    // send the untouched end endpoint jumping across the shape
    await page.mouse.move(740, 208);
    await page.mouse.down();
    await page.mouse.move(760, 230, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);
    const pivot = { x: 800, y: 200 };
    const radius = 60;
    const startWorld = { x: 700 + node.fills![0].start!.x * 200, y: 200 + node.fills![0].start!.y * 160 };
    const endWorld = { x: 700 + node.fills![0].end!.x * 200, y: 200 + node.fills![0].end!.y * 160 };

    expect(Math.hypot(startWorld.x - pivot.x, startWorld.y - pivot.y)).toBeCloseTo(radius, 0);
    expect(Math.hypot(endWorld.x - pivot.x, endWorld.y - pivot.y)).toBeCloseTo(radius, 0);
  });

  test('a gentle rotation of a box-attached, off-center gradient does not jump the other endpoint', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-rotate-off-center-box');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // bounds 700,200 - 900,360 (center 800,280); a corner-to-corner line along the BOTTOM edge —
    // start at the bottom-left corner, end at the bottom-right corner. Each corner touches a
    // distinct wall (left vs right), so this is still "box" mode, but the line itself does not pass
    // through the box center at all (it's the bottom edge, y=360, not y=280) — a real reported
    // regression where any rotation, however gentle, immediately forced the line through the center
    // and sent the untouched endpoint jumping far across the shape
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 1, y: 1 },
                opacity: 100,
                start: { x: 0, y: 1 },
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

    // grab 8px above the end endpoint (900,360) — past its inner move zone — and nudge it only
    // slightly, staying close to its own starting angle
    await page.mouse.move(900, 352);
    await page.mouse.down();
    await page.mouse.move(895, 345, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);
    const startWorld = { x: 700 + node.fills![0].start!.x * 200, y: 200 + node.fills![0].start!.y * 160 };
    const endWorld = { x: 700 + node.fills![0].end!.x * 200, y: 200 + node.fills![0].end!.y * 160 };

    // both endpoints stay close to their original corners; the old box-center-symmetric model would
    // instead have snapped the untouched start endpoint over 100px away from (700,360)
    expect(Math.hypot(startWorld.x - 700, startWorld.y - 360)).toBeLessThan(30);
    expect(Math.hypot(endWorld.x - 900, endWorld.y - 360)).toBeLessThan(30);
  });

  test('rotating a gradient snaps to exactly horizontal when the angle is close to it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-rotate-snap');
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

    // grab 8px below the end endpoint (900,280) — past its inner move zone, so this actually arms
    // the rotate drag — then move to just 5px off horizontal over 100px of travel (~2.9deg from the
    // box center), inside the snap tolerance, so it should lock exactly onto y=0.5 instead of
    // landing at the raw, slightly-off position
    await page.mouse.move(900, 288);
    await page.mouse.down();
    await page.mouse.move(900, 285, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].end).toEqual({ x: 1, y: 0.5 });
    expect(node.fills![0].start).toEqual({ x: 0, y: 0.5 });
  });

  test('grabbing right at a gradient endpoint moves it freely, leaving the other endpoint untouched', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-endpoint-move');
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

    // grab exactly on the start endpoint (700,280) and drag it well away from any snap landmark —
    // this must move the point freely instead of rotating the line
    await page.mouse.move(700, 280);
    await page.mouse.down();
    await page.mouse.move(770, 250, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].start!.x).toBeCloseTo(0.35, 2);
    expect(node.fills![0].start!.y).toBeCloseTo(0.3125, 2);
    expect(node.fills![0].end).toEqual({ x: 1, y: 0.5 });
  });

  test('dragging a gradient endpoint freely snaps onto a shape corner', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-endpoint-move-snap');
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

    // grab the end endpoint (900,280) and drag it a few px shy of the bottom-right corner (900,360)
    await page.mouse.move(900, 280);
    await page.mouse.down();
    await page.mouse.move(897, 357, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].end).toEqual({ x: 1, y: 1 });
    expect(node.fills![0].start).toEqual({ x: 0, y: 0.5 });
  });

  test('dragging a gradient endpoint past the shape edge lets it travel outside the shape, like Figma', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-endpoint-move-outside');
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

    // grab the end endpoint (900,280) and drag it well past the right edge (900) — far from any snap landmark
    await page.mouse.move(900, 280);
    await page.mouse.down();
    await page.mouse.move(950, 250, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].end!.x).toBeCloseTo(1.25, 2);
    expect(node.fills![0].end!.y).toBeCloseTo(0.3125, 2);
    expect(node.fills![0].start).toEqual({ x: 0, y: 0.5 });
  });

  test('moving a radial gradient’s center point on the canvas moves only that point', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-radial-move');
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
                type: 'gradient-radial',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // grab exactly on the center point (700,280) and drag it, well away from any snap landmark
    await page.mouse.move(700, 280);
    await page.mouse.down();
    await page.mouse.move(770, 250, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].start!.x).toBeCloseTo(0.35, 2);
    expect(node.fills![0].start!.y).toBeCloseTo(0.3125, 2);
    expect(node.fills![0].end).toEqual({ x: 1, y: 0.5 });
  });

  test('dragging a radial gradient’s perpendicular radius handle reshapes the ellipse', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-radial-radius-handle');
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
                type: 'gradient-radial',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // the perpendicular radius handle for this configuration sits at world (700, 440) — 80px below
    // the shape's bottom edge, a full primary-radius (160px) away from the center at (700,280)
    await page.mouse.move(700, 440);
    await page.mouse.down();
    await page.mouse.move(700, 360, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].radiusRatio).toBeCloseTo(0.5, 2);
    expect(node.fills![0].start).toEqual({ x: 0, y: 0.5 });
    expect(node.fills![0].end).toEqual({ x: 1, y: 0.5 });
  });

  test('dragging the outer ring around a radial gradient’s center rotates the whole ellipse around it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-radial-rotate-from-center');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // center (800,280), edge straight down at (800,360) — an 80px radius
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 0.5, y: 1 },
                opacity: 100,
                start: { x: 0.5, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-radial',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // grab 8px left of the center (800,280) — past the inner move zone, within the outer rotate ring
    // (the left side is used deliberately: for this vertical line the stops are offset to the right
    // of the axis, so grabbing on the left avoids colliding with the stop at position 0)
    await page.mouse.move(792, 280);
    await page.mouse.down();
    await page.mouse.move(800, 200, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    // the center never moves; the edge point swings from straight-down to straight-up, radius unchanged
    expect(node.fills![0].start).toEqual({ x: 0.5, y: 0.5 });
    expect(node.fills![0].end!.x).toBeCloseTo(0.5, 2);
    expect(node.fills![0].end!.y).toBeCloseTo(0, 2);
  });

  test('dragging the outer ring around a radial gradient’s edge point also rotates around the center', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-radial-rotate-from-edge');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // center (800,280), edge straight down at (800,360) — an 80px radius
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 0.5, y: 1 },
                opacity: 100,
                start: { x: 0.5, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-radial',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // grab 8px below the edge point (800,360) — past its inner move zone, within its outer rotate ring
    await page.mouse.move(800, 368);
    await page.mouse.down();
    await page.mouse.move(700, 280, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    // still pivots at the center, not the edge point itself
    expect(node.fills![0].start).toEqual({ x: 0.5, y: 0.5 });
    expect(node.fills![0].end!.x).toBeCloseTo(0.1, 2);
    expect(node.fills![0].end!.y).toBeCloseTo(0.5, 2);
  });

  test('dragging a radial gradient’s radius handle shows an orange guide from the center, only while dragging', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-radial-radius-guide');
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
                type: 'gradient-radial',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // the handle follows the cursor 1:1, so once it settles at (700,400) the fill itself (radiusRatio)
    // is identical whether the drag is still active or just released — only the guide overlay differs.
    // Sampling the same point (the guide's midpoint) in both states isolates exactly that difference,
    // without needing to know the guide's exact color against the moving gradient fill underneath it
    await page.mouse.move(700, 440);
    await page.mouse.down();
    await page.mouse.move(700, 400, { steps: 10 });
    await page.waitForTimeout(50);

    const duringDrag = await readPixelColor(page, 700, 340);

    await page.mouse.up();
    await page.waitForTimeout(100);

    const afterRelease = await readPixelColor(page, 700, 340);

    expect(duringDrag).not.toEqual(afterRelease);
  });

  test('switching a shape gradient to Radial via the panel resets its points to a centered default', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-gradient-type-switch-reset');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // an unrelated diagonal line — simulates a gradient with a position left over from before
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 0.9, y: 0.1 },
                opacity: 100,
                start: { x: 0.2, y: 0.8 },
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

    await page.locator('[class*="GradientActions__type-dropdown"]').click();
    await page.getByText('Radial', { exact: true }).click();

    const node = await readNode(page, id);

    // radial's default: point A (center) at the shape's center, point B on the bottom edge
    expect(node.fills![0].start).toEqual({ x: 0.5, y: 0.5 });
    expect(node.fills![0].end).toEqual({ x: 0.5, y: 1 });
    expect(node.fills![0].type).toBe('gradient-radial');
  });

  test('switching a shape gradient to Angular via the panel resets its points to a centered default, same as Radial', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-angular-type-switch-reset');
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
                end: { x: 0.9, y: 0.1 },
                opacity: 100,
                start: { x: 0.2, y: 0.8 },
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

    await page.locator('[class*="GradientActions__type-dropdown"]').click();
    await page.getByText('Angular', { exact: true }).click();

    const node = await readNode(page, id);

    expect(node.fills![0].start).toEqual({ x: 0.5, y: 0.5 });
    expect(node.fills![0].end).toEqual({ x: 0.5, y: 1 });
    expect(node.fills![0].type).toBe('gradient-angular');
  });

  test('switching a shape gradient to Diamond via the panel resets its points to a centered default, same as Radial', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-diamond-type-switch-reset');
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
                end: { x: 0.9, y: 0.1 },
                opacity: 100,
                start: { x: 0.2, y: 0.8 },
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

    await page.locator('[class*="GradientActions__type-dropdown"]').click();
    await page.getByText('Diamond', { exact: true }).click();

    const node = await readNode(page, id);

    expect(node.fills![0].start).toEqual({ x: 0.5, y: 0.5 });
    expect(node.fills![0].end).toEqual({ x: 0.5, y: 1 });
    expect(node.fills![0].type).toBe('gradient-diamond');
  });

  test('a diamond gradient renders as an actual diamond shape instead of a flat fill', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-diamond-render');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // centered diamond default: A (center) at the shape's center, B on the bottom edge — the
    // shape's 4 corners sit outside the diamond (t > 1, clamped to the last stop's color) while
    // the center sits at t = 0 (the first stop's color)
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 0.5, y: 1 },
                opacity: 100,
                start: { x: 0.5, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-diamond',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await designPage.click(1500, 600); // deselect

    const [centerR, centerG, centerB] = await readPixelColor(page, 800, 280);
    const [cornerR, cornerG, cornerB] = await readPixelColor(page, 701, 201);

    // the shader bug clamped almost the entire fill to the last stop's color (near-black)
    // everywhere except a thin band — so the center must be near-white, not near-black
    expect(centerR).toBeGreaterThan(200);
    expect(centerG).toBeGreaterThan(200);
    expect(centerB).toBeGreaterThan(200);

    expect(cornerR).toBeLessThan(50);
    expect(cornerG).toBeLessThan(50);
    expect(cornerB).toBeLessThan(50);
  });

  test('dragging a diamond gradient’s perpendicular radius handle reshapes it, exactly like radial’s', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-diamond-radius-handle');
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
                type: 'gradient-diamond',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // the perpendicular radius handle for this configuration sits at world (700, 440) — 80px below
    // the shape's bottom edge, a full primary-radius (160px) away from the center at (700,280)
    await page.mouse.move(700, 440);
    await page.mouse.down();
    await page.mouse.move(700, 360, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].radiusRatio).toBeCloseTo(0.5, 2);
    expect(node.fills![0].start).toEqual({ x: 0, y: 0.5 });
    expect(node.fills![0].end).toEqual({ x: 1, y: 0.5 });
  });

  test('dragging the outer ring around a diamond gradient’s center rotates the whole shape around it, exactly like radial’s', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-diamond-rotate-from-center');
    await expect(designPage.canvas).toBeVisible();

    // center (800,280), edge straight down at (800,360) — an 80px radius
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
                end: { x: 0.5, y: 1 },
                opacity: 100,
                start: { x: 0.5, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-diamond',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // grab 8px left of the center (800,280) — past the inner move zone, within the outer rotate ring
    await page.mouse.move(792, 280);
    await page.mouse.down();
    await page.mouse.move(800, 200, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    // the center never moves; the edge point swings from straight-down to straight-up, radius unchanged
    expect(node.fills![0].start).toEqual({ x: 0.5, y: 0.5 });
    expect(node.fills![0].end!.x).toBeCloseTo(0.5, 2);
    expect(node.fills![0].end!.y).toBeCloseTo(0, 2);
  });

  test('dragging an angular gradient’s perpendicular radius handle reshapes its ellipse, just like radial’s', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-angular-radius-handle');
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
                type: 'gradient-angular',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // same geometry as the radial radius-handle test: the perpendicular handle sits at world (700, 440)
    await page.mouse.move(700, 440);
    await page.mouse.down();
    await page.mouse.move(700, 360, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    expect(node.fills![0].radiusRatio).toBeCloseTo(0.5, 2);
    expect(node.fills![0].start).toEqual({ x: 0, y: 0.5 });
    expect(node.fills![0].end).toEqual({ x: 1, y: 0.5 });
    expect(node.fills![0].type).toBe('gradient-angular');
  });

  test('dragging an angular gradient stop around the ellipse moves it by angle, not by linear position along the line', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-angular-stop-drag');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // center (800,280), primary axis endpoint straight down at (800,360) — both default stops
    // (position 0 and 1) coincide there, since a full turn wraps an angular gradient back onto itself
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 0.5, y: 1 },
                opacity: 100,
                start: { x: 0.5, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-angular',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // grab the coincident stop marker — the ellipse point (800,360) nudged 18px further out (away
    // from the center at (800,280)), same as radial/linear's beside-the-line offset — and drag it to
    // (700,280), the perpendicular radius-handle point, which sits at angle 0.25 around the ellipse
    // (a linear-projection formula would instead clamp this point, off the start->end line entirely,
    // to position 0)
    await page.mouse.move(800, 378);
    await page.mouse.down();
    await page.mouse.move(700, 280, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);
    const stops = node.fills![0].stops!;

    expect(stops.find((stop) => stop.color === '#ffffff')?.position).toBeCloseTo(0.25, 2);
    expect(stops.find((stop) => stop.color === '#000000')?.position).toBe(1);
  });

  test('clicking the ellipse guide on an angular gradient adds a new stop there and selects it', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-angular-add-stop-on-ellipse');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // center (800,280), primary axis endpoint (800,360) — world (729,337) sits on the ellipse at
    // angle 0.125 (45deg), clear of the center/endpoint/radius-handle hit zones
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 0.5, y: 1 },
                opacity: 100,
                start: { x: 0.5, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-angular',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // hovering the ellipse (away from any handle or existing stop) shows the add-stop preview
    const beforeHover = await designPage.canvas.screenshot();

    await page.mouse.move(729, 337);

    const afterHover = await designPage.canvas.screenshot();

    expect(afterHover.equals(beforeHover)).toBe(false);

    // clicking there adds a new stop at ~12.5% and selects it
    await page.mouse.down();
    await page.mouse.up();

    const node = await readNode(page, id);
    const stops = node.fills![0].stops!;

    expect(stops).toHaveLength(3);

    const addedStop = stops.find((stop) => stop.position !== 0 && stop.position !== 1);

    expect(addedStop?.position).toBeCloseTo(0.125, 2);

    const gradientEditor = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');

      return store.getState().design.gradientEditor;
    });

    expect(gradientEditor?.selectedStopIndex).toBe(stops.indexOf(addedStop!));

    // result — the docked panel's own stop list/bar picks up the canvas-added stop too, not just Redux
    await expect(page.getByLabel('Stop marker')).toHaveCount(3);
  });

  test('opening the picker on an existing angular gradient shows Angular in the type dropdown, not Linear', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-angular-dropdown-reflects-type');
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
                end: { x: 0.5, y: 1 },
                opacity: 100,
                start: { x: 0.5, y: 0.5 },
                stops: [
                  { color: '#ffffff', opacity: 100, position: 0 },
                  { color: '#000000', opacity: 100, position: 1 },
                ],
                type: 'gradient-angular',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    // before this fix the panel always seeded its local type state to the default (Linear),
    // regardless of the paint actually being edited
    await page.getByLabel('Hex color').click();

    await expect(page.locator('[class*="GradientActions__type-dropdown"]')).toHaveText('Angular');
  });

  test('switching a gradient fill to Solid and back to Gradient starts fresh, instead of resurfacing the old paint', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-solid-resets-gradient-panel');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // a custom radial gradient, far from the plain default
    await page.evaluate(async (nodeId) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        updateNode({
          changes: {
            fills: [
              {
                end: { x: 0.9, y: 0.1 },
                opacity: 100,
                radiusRatio: 0.4,
                start: { x: 0.2, y: 0.8 },
                stops: [
                  { color: '#ff00ff', opacity: 100, position: 0 },
                  { color: '#00ffff', opacity: 100, position: 1 },
                ],
                type: 'gradient-radial',
              },
            ],
          },
          id: nodeId,
        }),
      );
    }, id);

    await page.getByLabel('Hex color').click();

    // action — switch to Solid, then back to Gradient in the same open session
    await page.getByLabel('Solid').click();
    await page.getByLabel('Gradient').click();

    const node = await readNode(page, id);
    const fill = node.fills![0];

    // result — a fresh plain default (linear, default stops), not the old radial/custom paint
    expect(fill.type).toBe('gradient-linear');
    expect(fill.start).toEqual({ x: 0, y: 0.5 });
    expect(fill.end).toEqual({ x: 1, y: 0.5 });
    expect(fill.stops).toEqual([
      { color: '#d9d9d9', opacity: 100, position: 0 },
      { color: '#737373', opacity: 100, position: 1 },
    ]);
  });

  test('undoing a gradient type change updates the open panel’s own type dropdown, not just the render', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-undo-updates-open-panel');
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

    await page.locator('[class*="GradientActions__type-dropdown"]').click();
    await page.getByText('Radial', { exact: true }).click();

    await expect(page.locator('[class*="GradientActions__type-dropdown"]')).toHaveText('Radial');

    // move focus off the dropdown's own trigger button first — it swallows keydown itself otherwise
    await page.getByText('Stops', { exact: false }).first().click();

    // action — undo the type switch while the panel is still open
    await page.keyboard.press('Control+z');

    // result — the node itself is back to linear...
    const node = await readNode(page, id);

    expect(node.fills![0].type).toBe('gradient-linear');

    // ...and so is the panel's own dropdown, which used to stay stuck on the pre-undo value
    await expect(page.locator('[class*="GradientActions__type-dropdown"]')).toHaveText('Linear');
  });

  test('dragging a stop color on the saturation map coalesces into a single undo step, instead of one per pixel', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-saturation-drag-history');
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
    await page.getByLabel('Stop color').first().click();

    const map = page.locator('[class*="SaturationMap__input"]');
    const mapBox = (await map.boundingBox())!;

    // action — drag from the white corner (s:0, v:100) across to the fully-saturated corner (s:100, v:100),
    // in many small steps so an uncoalesced implementation would push many separate history entries
    await page.mouse.move(mapBox.x + 1, mapBox.y + 1);
    await page.mouse.down();
    await page.mouse.move(mapBox.x + mapBox.width - 1, mapBox.y + 1, { steps: 15 });
    await page.mouse.up();

    const draggedColor = (await readNode(page, id)).fills![0].stops![0].color;

    expect(draggedColor).not.toBe('#ffffff');

    // action — a single undo
    await page.keyboard.press('Control+z');

    // result — the whole drag reverts in one step, back to the exact original color
    const undoneColor = (await readNode(page, id)).fills![0].stops![0].color;

    expect(undoneColor).toBe('#ffffff');
  });

  test('rotating a gradient on the canvas, then dragging a stop inside the popover, keeps the canvas rotation', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-canvas-rotate-then-popover-drag');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // horizontal gradient across the rectangle (bounds 700,200 - 900,360, center 800,280)
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

    // rotate the line 90° via the canvas (same drag as the dedicated rotate test above)
    await page.mouse.move(900, 288);
    await page.mouse.down();
    await page.mouse.move(800, 150, { steps: 10 });
    await page.mouse.up();

    const rotated = await readNode(page, id);

    expect(rotated.fills![0].end!.x).toBeCloseTo(0.5, 1);
    expect(rotated.fills![0].end!.y).toBeCloseTo(0, 1);

    // action — now drag a stop's thumb inside the still-open popover's own gradient bar
    const barBox = (await page.locator('[class*="GradientBar__wrapper"]').boundingBox())!;
    const thumbs = page.getByLabel('Stop marker');
    const blackThumbBox = (await thumbs.nth(1).boundingBox())!;
    const thumbY = blackThumbBox.y + blackThumbBox.height / 2;

    await page.mouse.move(blackThumbBox.x + blackThumbBox.width / 2, thumbY);
    await page.mouse.down();
    await page.mouse.move(barBox.x + barBox.width * 0.7, thumbY, { steps: 10 });
    await page.mouse.up();

    const node = await readNode(page, id);

    // result — the popover drag only moved the stop's position; the line is still the rotated one,
    // not reset back to the original horizontal start/end
    expect(node.fills![0].end!.x).toBeCloseTo(0.5, 1);
    expect(node.fills![0].end!.y).toBeCloseTo(0, 1);
    expect(node.fills![0].start!.x).toBeCloseTo(0.5, 1);
    expect(node.fills![0].start!.y).toBeCloseTo(1, 1);
    expect(node.fills![0].stops!.find((stop) => stop.color === '#000000')!.position).toBeCloseTo(0.7, 1);
  });

  test('moving a gradient stop on the canvas updates its position live in the open popover', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-canvas-stop-move-live-popover');
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

    const blackStopPositionField = page.getByLabel('Stop position').nth(1);

    await expect(blackStopPositionField).toHaveValue('100%');

    // action — drag the black stop's on-canvas swatch from the right edge toward the middle
    await page.mouse.move(900, 258);
    await page.mouse.down();
    await page.mouse.move(800, 258, { steps: 10 });
    await page.mouse.up();

    // result — the still-open popover's own position field reflects the canvas-driven change live,
    // instead of staying stuck on the value it had when the popover was opened
    const updatedValue = await blackStopPositionField.inputValue();

    expect(updatedValue).not.toBe('100%');
    expect(Number(updatedValue.replace('%', ''))).toBeGreaterThan(40);
    expect(Number(updatedValue.replace('%', ''))).toBeLessThan(60);
  });

  test('the alpha field’s "%" stays visible and the field does not resize while it is focused', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-alpha-percent-stays-visible-on-focus');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    await page.getByLabel('Hex color').click();

    const alphaField = page.locator('[class*="ColorPickerInput__alpha"]');
    const percentSign = alphaField.getByText('%');

    await expect(percentSign).toBeVisible();
    const widthBefore = (await alphaField.boundingBox())!.width;

    // action — focus the alpha input
    await alphaField.locator('input').click();

    // result — the "%" is still there, and the field kept its width instead of expanding to fill
    // the space the (before this fix, hidden-on-focus) adornment used to occupy
    await expect(percentSign).toBeVisible();
    const widthAfter = (await alphaField.boundingBox())!.width;

    expect(widthAfter).toBeCloseTo(widthBefore, 0);
  });

  test('switching a solid fill to Pattern commits a pattern paint and shows the Pattern panel', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-switch-to-pattern');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();

    // action
    await page.getByLabel('Pattern').click();

    // result — the fill row now shows the literal "Pattern" text, and the committed paint is real
    await expect(page.locator('input[value="Pattern"]')).toBeVisible();

    const node = await readNode(page, id);

    expect(node.fills![0].type).toBe('pattern');

    // result — the still-open picker shows the Pattern panel content
    await expect(page.getByRole('button', { name: 'Select source...' })).toBeVisible();
  });

  test('picking a shape as the pattern source on canvas writes its id onto the paint and disarms picking', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-source-pick');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const targetId = await readFirstNodeId(page);

    await designPage.drawRectangle(1000, 200, 1100, 300);

    const sourceId = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].rootOrder[1];
    });

    // reselect the target rectangle, whose own draw was superseded by the source rectangle's
    await designPage.canvas.click({ position: { x: 800, y: 280 } });

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();

    // action — click the other rectangle on the canvas while picking is armed
    await designPage.canvas.click({ position: { x: 1050, y: 250 } });

    const node = await readNode(page, targetId);

    expect(node.fills![0]).toMatchObject({ sourceNodeId: sourceId, type: 'pattern' });

    const isPatternSourcePicking = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');

      return store.getState().design.isPatternSourcePicking;
    });

    expect(isPatternSourcePicking).toBe(false);
  });

  test('a picked pattern source renders live, repeating its own color across the shape', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-source-render');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const targetId = await readFirstNodeId(page);

    // a small 20x20 source rectangle, filled pure green
    await designPage.drawRectangle(1000, 200, 1020, 220);

    const sourceId = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const id = pages[activePageId].rootOrder[1];

      store.dispatch(updateNode({ changes: { fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }, id }));

      return id;
    });

    // reselect the target rectangle, then pick the green rectangle as its pattern source
    await designPage.canvas.click({ position: { x: 800, y: 280 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();
    await designPage.canvas.click({ position: { x: 1010, y: 210 } });

    const node = await readNode(page, targetId);

    expect(node.fills![0].sourceNodeId).toBe(sourceId);

    // result — the source's own color shows up at the first tile cell (700-720, 200-220)...
    expect(await readPixelColor(page, 710, 210)).toEqual([0, 255, 0]);
    // ...and again one tile width over (720-740), proving it actually repeats, not a single stretched copy
    expect(await readPixelColor(page, 730, 210)).toEqual([0, 255, 0]);

    // action — change the source's own fill; nothing re-selects it or touches the pattern paint itself
    await page.evaluate(async (id) => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');

      store.dispatch(updateNode({ changes: { fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] }, id }));
    }, sourceId);

    // result — the tiled render picks up the live change on the very next frame
    expect(await readPixelColor(page, 710, 210)).toEqual([255, 0, 0]);
  });

  test('a pattern fill with no source renders a placeholder dot grid on the shape instead of nothing', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-placeholder-render');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const before = await designPage.canvas.screenshot();

    await page.getByLabel('Hex color').click();

    // action
    await page.getByLabel('Pattern').click();

    // result — the render changes, and a dot grid cell center is a solid white dot, not the solid
    // color the shape started with nor a blank/untouched canvas (no background fill — dots only)
    const after = await designPage.canvas.screenshot();

    expect(after.equals(before)).toBe(false);
    expect(await readPixelColor(page, 710, 210)).toEqual([255, 255, 255]);
  });

  test('editing the Pattern panel’s tile type and scale commits them onto the pattern paint', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-properties-commit');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();

    // action
    await page.getByLabel('Hexagonal', { exact: true }).click();

    const scaleInput = page.locator('[data-test-text-field-input="pattern-scale"]');

    await scaleInput.fill('50');
    await scaleInput.blur();

    // result
    const node = await readNode(page, id);
    const fill = node.fills![0];

    expect(fill.tileType).toBe('hexagonal');
    expect(fill.scale).toBe(50);
  });

  test('switching away from Pattern and back resets the panel instead of resurfacing the old values', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-resets-on-tab-switch');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByLabel('Hexagonal', { exact: true }).click();

    const scaleInput = page.locator('[data-test-text-field-input="pattern-scale"]');

    await scaleInput.fill('50');
    await scaleInput.blur();

    // action — leave Pattern, then come back in the same open session
    await page.getByLabel('Solid').click();
    await page.getByLabel('Pattern').click();

    // result — a fresh default, not the 50%/hexagonal values from the earlier edit
    await expect(page.getByRole('button', { name: 'Rectangular' })).toHaveAttribute('aria-pressed', 'true');
    await expect(scaleInput).toHaveValue('100%');
  });

  test('the Direction row only shows for the Hexagonal tile type', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-direction-row');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();

    // result — not shown for the default Rectangular tile type
    await expect(page.getByRole('button', { exact: true, name: 'Horizontal' })).not.toBeVisible();

    // action
    await page.getByLabel('Hexagonal', { exact: true }).click();

    // result — shown once Hexagonal is selected, and clicking Vertical commits it onto the paint
    await expect(page.getByRole('button', { exact: true, name: 'Horizontal' })).toBeVisible();
    await page.getByRole('button', { exact: true, name: 'Vertical' }).click();

    const node = await readNode(page, id);

    expect(node.fills![0].direction).toBe('vertical');
  });
});
