import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

type TReadablePaint = {
  alignmentIndex?: number;
  color?: string;
  crop?: { height: number; rotation: number; width: number; x: number; y: number };
  direction?: string;
  end?: { x: number; y: number };
  flipX?: boolean;
  flipY?: boolean;
  opacity: number;
  ref?: string;
  rotation?: number;
  scale?: number;
  scaleMode?: string;
  sourceNodeId?: string | null;
  spacingX?: number;
  spacingY?: number;
  start?: { x: number; y: number };
  stops?: { color: string; opacity: number; position: number }[];
  tileType?: string;
  type: string;
  visible?: boolean;
};
type TReadableNode = { fills?: TReadablePaint[]; height?: number; width?: number; x?: number; y?: number };
type TReadableImageEditor = { mode: string; nodeId: string; paintIndex: number; selectedTarget?: string } | null;

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

const readImageEditor = (page: Page): Promise<TReadableImageEditor> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');

    return store.getState().design.imageEditor;
  });

const readSelectedIds = (page: Page): Promise<string[]> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].selectedIds;
  });

// samples a single pixel's RGB out of a tiny clipped screenshot — same PNG-decode technique
// mask.spec.ts / vector-edit.spec.ts use for pixel-level assertions
const readPixelColor = async (page: Page, x: number, y: number): Promise<[number, number, number]> => {
  const { PNG } = await import('pngjs');
  const screenshot = await page.screenshot({ clip: { height: 1, width: 1, x, y } });
  const png = PNG.sync.read(screenshot);

  return [png.data[0], png.data[1], png.data[2]];
};

// builds a tiny in-memory PNG of a single solid color, so image-fill tests can upload a real,
// known-color file without committing a binary fixture to the repo
const createSolidColorPngBuffer = async (width: number, height: number, [r, g, b]: [number, number, number]): Promise<Buffer> => {
  const { PNG } = await import('pngjs');
  const png = new PNG({ height, width });

  for (let index = 0; index < width * height; index += 1) {
    png.data[index * 4] = r;
    png.data[index * 4 + 1] = g;
    png.data[index * 4 + 2] = b;
    png.data[index * 4 + 3] = 255;
  }

  return PNG.sync.write(png);
};

// builds a tiny in-memory PNG split vertically into two solid colors, so a 90° image-fill rotation
// (which swaps which screen edge the left/right halves land on) produces a detectable pixel change
const createSplitColorPngBuffer = async (
  size: number,
  leftColor: [number, number, number],
  rightColor: [number, number, number],
): Promise<Buffer> => {
  const { PNG } = await import('pngjs');
  const png = new PNG({ height: size, width: size });

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const [r, g, b] = x < size / 2 ? leftColor : rightColor;

      png.data[index] = r;
      png.data[index + 1] = g;
      png.data[index + 2] = b;
      png.data[index + 3] = 255;
    }
  }

  return PNG.sync.write(png);
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

  test('panning with the middle mouse button does not dismiss an open fill color picker', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-picker-survives-middle-click-pan');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    await page.getByLabel('Hex color').click();

    const panel = page.locator('[class*="ColorPicker_"]').first();

    await expect(panel).toBeVisible();

    await designPage.panBy(150, 90);

    await expect(panel).toBeVisible();
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

  test('picking a node that itself has a pattern fill as a source is refused, preventing A<-B<-C chains', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-source-chain-refused');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const targetId = await readFirstNodeId(page);

    // a second rectangle that is itself already a pattern consumer (no source picked yet)
    await designPage.drawRectangle(1000, 200, 1100, 300);
    await designPage.canvas.click({ position: { x: 1050, y: 250 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();

    // action — reselect the target, arm picking, then click the pattern-holding rectangle
    await designPage.canvas.click({ position: { x: 800, y: 280 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();
    await designPage.canvas.click({ position: { x: 1050, y: 250 } });

    // result — refused, same as picking itself: no sourceNodeId written, picking disarmed
    const node = await readNode(page, targetId);

    expect(node.fills![0].sourceNodeId).toBeFalsy();

    const isPatternSourcePicking = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');

      return store.getState().design.isPatternSourcePicking;
    });

    expect(isPatternSourcePicking).toBe(false);
  });

  test('hovering an eligible node while picking a pattern source shows a live highlight, like the default tool', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-source-hover-highlight');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    // a second, plain rectangle — eligible to be picked as a pattern source
    await designPage.drawRectangle(1000, 200, 1100, 300);

    // reselect the target rectangle, whose own draw was superseded by the source rectangle's
    await designPage.canvas.click({ position: { x: 800, y: 280 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();

    // move off both shapes first, so the "before" screenshot has no stale hover from an earlier step
    await page.mouse.move(1550, 600);

    // a tight clip around just the eligible rectangle, so unrelated pixels under the open picker
    // popover elsewhere on screen can't introduce noise into the comparison
    const clip = { height: 120, width: 120, x: 990, y: 190 };
    const beforeHover = await page.screenshot({ clip });

    // action — hover the eligible rectangle without clicking
    await page.mouse.move(1050, 250);

    const afterHover = await page.screenshot({ clip });

    // result — a live outline is drawn around the hovered, pickable rectangle
    expect(afterHover.equals(beforeHover)).toBe(false);
  });

  test('hovering a node that already has a pattern fill while picking a source shows no highlight', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-source-hover-refused');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    // a second rectangle that is itself already a pattern consumer — not eligible as a source
    await designPage.drawRectangle(1000, 200, 1100, 300);
    await designPage.canvas.click({ position: { x: 1050, y: 250 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();

    // reselect the target, arm picking
    await designPage.canvas.click({ position: { x: 800, y: 280 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();

    await page.mouse.move(1550, 600);

    // a tight clip around just the ineligible rectangle, so unrelated pixels under the open picker
    // popover elsewhere on screen can't introduce noise into the comparison
    const clip = { height: 120, width: 120, x: 990, y: 190 };
    const beforeHover = await page.screenshot({ clip });

    // action — hover the ineligible, pattern-holding rectangle without clicking
    await page.mouse.move(1050, 250);

    const afterHover = await page.screenshot({ clip });

    // result — no outline is drawn, since picking it would create a chain
    expect(afterHover.equals(beforeHover)).toBe(true);
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

  test("shrinking a pattern source's text content does not leave a black shadow of the old glyphs", async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-source-text-shrink');
    await expect(designPage.canvas).toBeVisible();

    // text source, wide enough that "Mama" renders unclipped
    await designPage.drawTextBox(1000, 200, 1300, 260);
    await designPage.typeText('Mama');
    await designPage.click(1550, 600);

    // frame consumer, elsewhere
    await designPage.drawFrame(700, 400, 900, 500);
    const frameId = await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { activePageId, pages } = store.getState().design;

      return pages[activePageId].rootOrder[1];
    });

    await designPage.canvas.click({ position: { x: 800, y: 450 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();
    await designPage.canvas.click({ position: { x: 1015, y: 208 } });

    const node = await readNode(page, frameId);

    expect(node.fills![0].sourceNodeId).toBeTruthy();

    // result — with the full "Mama" content, this point (inside the "a" that "M" alone won't
    // reach) shows glyph ink, not background — confirms the coordinate actually lands on the part
    // of the word that's about to be removed
    expect(await readPixelColor(page, 718, 410)).toEqual([255, 255, 255]);

    // action — shrink the source text from "Mama" to just "M"
    await designPage.click(1015, 208);
    await page.keyboard.press('Enter');
    await designPage.typeText('M');
    await designPage.click(1550, 600);

    // result — that same point, now past the end of "M", is neither the old glyph color nor a
    // leftover black shadow (a stale-alpha bug: clearing a recycled render-target texture while
    // alpha writes were still masked off zeroed the RGB channels but left the old opaque alpha
    // behind, painting the removed glyphs' footprint solid black)
    expect(await readPixelColor(page, 718, 410)).not.toEqual([0, 0, 0]);
  });

  test('increasing pattern spacing opens a visible gap between tiles instead of leaving them flush', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-spacing-render');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    // a small 20x20 source rectangle, filled pure green
    await designPage.drawRectangle(1000, 200, 1020, 220);

    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const id = pages[activePageId].rootOrder[1];

      store.dispatch(updateNode({ changes: { fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }, id }));
    });

    // reselect the target rectangle, then pick the green rectangle as its pattern source
    await designPage.canvas.click({ position: { x: 800, y: 280 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();
    await designPage.canvas.click({ position: { x: 1010, y: 210 } });

    // result — with no spacing, one tile width over (720-740) still shows the source color, flush
    expect(await readPixelColor(page, 730, 210)).toEqual([0, 255, 0]);

    // action — picking a source closes the picker popover, so reopen it to reach the spacing field,
    // then widen the gap to 100% of the tile size (20px source tile, so a 20px gap)
    await page.getByLabel('Hex color').click();

    const spacingXInput = page.locator('[data-test-text-field-input="pattern-spacing-x"]');

    await spacingXInput.fill('100');
    await spacingXInput.blur();

    // result — that same point (720-740 is now the gap between tile 0 and tile 1) no longer shows the source color
    expect(await readPixelColor(page, 730, 210)).not.toEqual([0, 255, 0]);
    // ...while the first tile cell itself is untouched
    expect(await readPixelColor(page, 710, 210)).toEqual([0, 255, 0]);
  });

  test('changing pattern alignment shifts which part of the tile grid is flush with the shape', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-alignment-render');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    // a small 20x20 source rectangle, filled pure green
    await designPage.drawRectangle(1000, 200, 1020, 220);

    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const id = pages[activePageId].rootOrder[1];

      store.dispatch(updateNode({ changes: { fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }, id }));
    });

    // reselect the target rectangle, then pick the green rectangle as its pattern source
    await designPage.canvas.click({ position: { x: 800, y: 280 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();
    await designPage.canvas.click({ position: { x: 1010, y: 210 } });

    // action — picking a source closes the picker popover, so reopen it, then add a 100% gap
    // (the alignment point only becomes visible once there's a gap for it to shift)
    await page.getByLabel('Hex color').click();

    const spacingXInput = page.locator('[data-test-text-field-input="pattern-spacing-x"]');

    await spacingXInput.fill('100');
    await spacingXInput.blur();

    // result — with the default top-left alignment, the gap between tile 0 and tile 1 (720-740) hides the source color
    expect(await readPixelColor(page, 730, 210)).not.toEqual([0, 255, 0]);

    // action — pick the top-right alignment point (index 3, col 2 — flush against the shape's right edge)
    await page.getByLabel('Alignment point 3').click();

    // result — flushing the grid to the right shifts the gap elsewhere, so that same point is now inside a tile
    expect(await readPixelColor(page, 730, 210)).toEqual([0, 255, 0]);
  });

  test('a numeric pattern offset nudges the tile grid independently of the alignment point', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-offset-render');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    // a small 20x20 source rectangle, filled pure green
    await designPage.drawRectangle(1000, 200, 1020, 220);

    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const id = pages[activePageId].rootOrder[1];

      store.dispatch(updateNode({ changes: { fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }, id }));
    });

    // reselect the target rectangle, then pick the green rectangle as its pattern source
    await designPage.canvas.click({ position: { x: 800, y: 280 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();
    await designPage.canvas.click({ position: { x: 1010, y: 210 } });

    // action — picking a source closes the picker popover, so reopen it, then add a 100% gap
    // (a 20px tile plus a 20px gap, a 40px period)
    await page.getByLabel('Hex color').click();

    const spacingXInput = page.locator('[data-test-text-field-input="pattern-spacing-x"]');

    await spacingXInput.fill('100');
    await spacingXInput.blur();

    // result — before any offset, the first tile cell (700-720) is green and the gap (720-740) is not
    expect(await readPixelColor(page, 710, 210)).toEqual([0, 255, 0]);
    expect(await readPixelColor(page, 730, 210)).not.toEqual([0, 255, 0]);

    // action — nudge the grid by exactly half the 40px period
    const offsetXInput = page.locator('[data-test-text-field-input="pattern-offset-x"]');

    await offsetXInput.fill('20');
    await offsetXInput.blur();

    // result — the tile and gap swap places: what was a tile is now a gap, and vice versa
    expect(await readPixelColor(page, 710, 210)).not.toEqual([0, 255, 0]);
    expect(await readPixelColor(page, 730, 210)).toEqual([0, 255, 0]);
  });

  test('hexagonal tiling with horizontal direction offsets alternate rows, creating a brick pattern', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-hex-horizontal-render');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    // a small 20x20 source rectangle, filled pure green
    await designPage.drawRectangle(1000, 200, 1020, 220);

    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const id = pages[activePageId].rootOrder[1];

      store.dispatch(updateNode({ changes: { fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }, id }));
    });

    // reselect the target rectangle, then pick the green rectangle as its pattern source
    await designPage.canvas.click({ position: { x: 800, y: 280 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();
    await designPage.canvas.click({ position: { x: 1010, y: 210 } });

    // action — picking a source closes the picker popover, so reopen it, then add a horizontal-only
    // gap (100% of the 20px tile) so the row offset has a gap to shift into
    await page.getByLabel('Hex color').click();

    const spacingXInput = page.locator('[data-test-text-field-input="pattern-spacing-x"]');

    await spacingXInput.fill('100');
    await spacingXInput.blur();

    // result — before switching tile type, both rows share the same gap column (720-740), so
    // row 0 (y 200-220) and row 1 (y 220-240) both miss the source color at x 730
    expect(await readPixelColor(page, 730, 210)).not.toEqual([0, 255, 0]);
    expect(await readPixelColor(page, 730, 230)).not.toEqual([0, 255, 0]);

    // action — switch to Hexagonal (Horizontal is its default direction)
    await page.getByLabel('Hexagonal', { exact: true }).click();

    // result — row 1 is shifted half a tile in X, so the point that was in its gap now falls inside
    // a tile, while row 0 (unshifted) still misses it — proving only alternate rows moved
    expect(await readPixelColor(page, 730, 210)).not.toEqual([0, 255, 0]);
    expect(await readPixelColor(page, 730, 230)).toEqual([0, 255, 0]);
  });

  test('hexagonal tiling with vertical direction offsets alternate columns, creating a brick pattern', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-hex-vertical-render');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    // a small 20x20 source rectangle, filled pure green
    await designPage.drawRectangle(1000, 200, 1020, 220);

    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const id = pages[activePageId].rootOrder[1];

      store.dispatch(updateNode({ changes: { fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }, id }));
    });

    // reselect the target rectangle, then pick the green rectangle as its pattern source
    await designPage.canvas.click({ position: { x: 800, y: 280 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();
    await designPage.canvas.click({ position: { x: 1010, y: 210 } });

    // action — picking a source closes the picker popover, so reopen it, then add a vertical-only
    // gap (100% of the 20px tile) so the column offset has a gap to shift into
    await page.getByLabel('Hex color').click();

    const spacingYInput = page.locator('[data-test-text-field-input="pattern-spacing-y"]');

    await spacingYInput.fill('100');
    await spacingYInput.blur();

    // result — before switching tile type, both columns share the same gap row (220-240), so
    // column 0 (x 700-720) and column 1 (x 720-740) both miss the source color at y 230
    expect(await readPixelColor(page, 710, 230)).not.toEqual([0, 255, 0]);
    expect(await readPixelColor(page, 730, 230)).not.toEqual([0, 255, 0]);

    // action — switch to Hexagonal, then Vertical direction
    await page.getByLabel('Hexagonal', { exact: true }).click();
    await page.getByRole('button', { exact: true, name: 'Vertical' }).click();

    // result — column 1 is shifted half a tile in Y, so the point that was in its gap now falls
    // inside a tile, while column 0 (unshifted) still misses it — proving only alternate columns moved
    expect(await readPixelColor(page, 710, 230)).not.toEqual([0, 255, 0]);
    expect(await readPixelColor(page, 730, 230)).toEqual([0, 255, 0]);
  });

  test('deleting a pattern source freezes the consumer’s last appearance instead of reverting to the placeholder', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-source-freeze-on-delete');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const targetId = await readFirstNodeId(page);

    // a small 20x20 source rectangle, filled pure blue
    await designPage.drawRectangle(1000, 200, 1020, 220);

    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const id = pages[activePageId].rootOrder[1];

      store.dispatch(updateNode({ changes: { fills: [{ color: '#0000ff', opacity: 100, type: 'solid' }] }, id }));
    });

    // reselect the target rectangle, then pick the blue rectangle as its pattern source
    await designPage.canvas.click({ position: { x: 800, y: 280 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();
    await designPage.canvas.click({ position: { x: 1010, y: 210 } });

    expect(await readPixelColor(page, 710, 210)).toEqual([0, 0, 255]);

    // action — select the source rectangle itself and delete it
    await designPage.canvas.click({ position: { x: 1010, y: 210 } });
    await page.keyboard.press('Delete');

    const node = await readNode(page, targetId);

    // result — the paint is frozen: no more live sourceNodeId, but the render is untouched
    expect(node.fills![0].sourceNodeId).toBeFalsy();
    expect(await readPixelColor(page, 710, 210)).toEqual([0, 0, 255]);
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

  test('uploading an image commits a real image paint and renders it, filling the shape while preserving its proportions', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-upload-render');
    await expect(designPage.canvas).toBeVisible();

    // a wide 200x80 rectangle, so a square source image must be cropped (not stretched) to cover it
    await designPage.drawRectangle(700, 200, 900, 280);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // action
    await page.locator('input[type="file"]').setInputFiles({
      buffer: await createSolidColorPngBuffer(40, 40, [255, 0, 0]),
      mimeType: 'image/png',
      name: 'source.png',
    });

    // result — a real image paint, pointing at the picked file
    await expect
      .poll(async () => {
        const node = await readNode(page, id);

        return node.fills![0];
      })
      .toMatchObject({ scaleMode: 'fill', type: 'image' });

    const node = await readNode(page, id);

    expect(node.fills![0].ref).toMatch(/^blob:/);

    // result — the shape actually renders the picked (pure red) image, cover-cropped to fill the
    // whole wide rectangle, not just a stretched/letterboxed portion of it
    await expect.poll(async () => readPixelColor(page, 710, 210)).toEqual([255, 0, 0]);
    await expect.poll(async () => readPixelColor(page, 890, 270)).toEqual([255, 0, 0]);
  });

  test("the fill's alpha field changes the rendered image's opacity, not just the paint's stored value", async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-opacity-render');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    await page.locator('input[type="file"]').setInputFiles({
      buffer: await createSolidColorPngBuffer(40, 40, [255, 0, 0]),
      mimeType: 'image/png',
      name: 'source.png',
    });

    // wait for the fully-opaque render before changing opacity, so the two reads are comparable
    await expect.poll(async () => readPixelColor(page, 710, 210)).toEqual([255, 0, 0]);

    // action — halve the fill's opacity
    const alphaField = page.locator('[class*="ColorPickerInput__alpha"] input');

    await alphaField.fill('50');
    await alphaField.blur();

    // result — blended with the backdrop behind the shape, the red channel drops well below 255
    const [red] = await readPixelColor(page, 710, 210);

    expect(red).toBeLessThan(230);
  });

  test('the rotate button turns an image fill 90° per click, and each turn is its own undo/redo step', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-rotate-history');
    await expect(designPage.canvas).toBeVisible();

    // a square shape so the square source image needs no cover-fit crop, keeping the halves exact
    await designPage.drawRectangle(700, 200, 780, 280);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    await page.locator('input[type="file"]').setInputFiles({
      buffer: await createSplitColorPngBuffer(40, [255, 0, 0], [0, 0, 255]),
      mimeType: 'image/png',
      name: 'source.png',
    });

    // left half red, right half blue — the source image as uploaded, before any rotation
    await expect.poll(async () => readPixelColor(page, 710, 240)).toEqual([255, 0, 0]);
    await expect.poll(async () => readPixelColor(page, 770, 240)).toEqual([0, 0, 255]);

    const rotateButton = page.getByRole('button', { name: 'Rotate image' });

    // action — first click: a 90° turn moves the left (red) half to the top edge
    await rotateButton.click();

    await expect.poll(async () => (await readNode(page, id)).fills![0].rotation).toBe(90);
    expect(await readPixelColor(page, 740, 210)).toEqual([255, 0, 0]);
    expect(await readPixelColor(page, 740, 270)).toEqual([0, 0, 255]);

    // action — second click: another 90° turn (180° total) moves red to the right edge
    await rotateButton.click();

    await expect.poll(async () => (await readNode(page, id)).fills![0].rotation).toBe(180);
    expect(await readPixelColor(page, 770, 240)).toEqual([255, 0, 0]);
    expect(await readPixelColor(page, 710, 240)).toEqual([0, 0, 255]);

    // action — third click: 270° total, red now on the bottom edge
    await rotateButton.click();

    await expect.poll(async () => (await readNode(page, id)).fills![0].rotation).toBe(270);
    expect(await readPixelColor(page, 740, 270)).toEqual([255, 0, 0]);
    expect(await readPixelColor(page, 740, 210)).toEqual([0, 0, 255]);

    // action — undo the last click alone: back to 180°, not all the way to the start
    await page.keyboard.press('Control+z');

    await expect.poll(async () => (await readNode(page, id)).fills![0].rotation).toBe(180);
    expect(await readPixelColor(page, 770, 240)).toEqual([255, 0, 0]);

    // action — undo again: back to the very first 90° turn
    await page.keyboard.press('Control+z');

    await expect.poll(async () => (await readNode(page, id)).fills![0].rotation).toBe(90);
    expect(await readPixelColor(page, 740, 210)).toEqual([255, 0, 0]);

    // action — redo: re-applies the 180° turn that was just undone
    await page.keyboard.press('Control+Shift+z');

    await expect.poll(async () => (await readNode(page, id)).fills![0].rotation).toBe(180);
    expect(await readPixelColor(page, 770, 240)).toEqual([255, 0, 0]);
  });

  test('switching the fill mode to Fit contains the image inside the shape instead of cropping it to cover', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-fit-mode');
    await expect(designPage.canvas).toBeVisible();

    // a wide 200x80 rectangle, so a square source image only fits fully inside it once letterboxed
    await designPage.drawRectangle(700, 200, 900, 280);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    await page.locator('input[type="file"]').setInputFiles({
      buffer: await createSolidColorPngBuffer(40, 40, [255, 0, 0]),
      mimeType: 'image/png',
      name: 'source.png',
    });

    // wait for the default cover-fit render before switching modes, so the two reads are comparable
    await expect.poll(async () => readPixelColor(page, 710, 240)).toEqual([255, 0, 0]);

    // action — switch the fill mode from Fill (cover) to Fit (contain)
    await page.locator('[class*="ImageFillModeRow__dropdown"]').click();
    await page.getByText('Fit', { exact: true }).click();

    // result — the paint's own scaleMode is committed for real, not just previewed locally
    await expect.poll(async () => (await readNode(page, id)).fills![0].scaleMode).toBe('fit');

    // result — a square image fit into a 200x80 shape only covers an 80x80 centered band; the
    // left/right margins fall outside that band and must no longer show the (fully opaque) red
    const [outsideLeft] = await readPixelColor(page, 710, 240);
    const [outsideRight] = await readPixelColor(page, 890, 240);

    expect(outsideLeft).not.toBe(255);
    expect(outsideRight).not.toBe(255);

    // result — the centered band itself still shows the image
    expect(await readPixelColor(page, 800, 240)).toEqual([255, 0, 0]);
  });

  test('picking a new image while Fit is already selected in the dropdown renders it as Fit, not Fill', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-fit-before-upload');
    await expect(designPage.canvas).toBeVisible();

    // a wide 200x80 rectangle, so Fill (cover) and Fit (contain) render visibly differently
    await designPage.drawRectangle(700, 200, 900, 280);

    const id = await readFirstNodeId(page);

    // action — switch to Image and pick Fit *before* a file is ever uploaded
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await page.locator('[class*="ImageFillModeRow__dropdown"]').click();
    await page.getByText('Fit', { exact: true }).click();

    // action — only now upload a square source
    await page.locator('input[type="file"]').setInputFiles({
      buffer: await createSolidColorPngBuffer(40, 40, [255, 0, 0]),
      mimeType: 'image/png',
      name: 'source.png',
    });

    // result — the paint commits as 'fit' straight away, not 'fill' with Fit only applying on a
    // second, separate dropdown pick (the bug: picking a new image used to always hardcode 'fill')
    await expect.poll(async () => (await readNode(page, id)).fills![0].scaleMode).toBe('fit');

    // result — renders letterboxed immediately: the margins never show the fully-opaque source,
    // and the centered band does — with no further dropdown interaction after the upload
    await expect.poll(async () => readPixelColor(page, 710, 240)).not.toEqual([255, 0, 0]);
    await expect.poll(async () => readPixelColor(page, 800, 240)).toEqual([255, 0, 0]);
  });

  test('picking Image with no source yet renders a checkerboard placeholder on the shape', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-placeholder');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // action — switch to the Image paint type without ever picking a file
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // result — a real (empty-ref) image paint is committed, not just a local UI preview
    await expect.poll(async () => (await readNode(page, id)).fills![0]).toMatchObject({ ref: '', type: 'image' });

    // result — the shape renders a checkerboard, not a flat/empty fill: two samples one square
    // apart (10px, the placeholder's own square size) always land in adjacent, differently-colored
    // squares regardless of the grid's exact phase
    await expect
      .poll(async () => {
        const [colorA, colorB] = await Promise.all([readPixelColor(page, 715, 215), readPixelColor(page, 725, 215)]);

        return JSON.stringify(colorA) !== JSON.stringify(colorB);
      })
      .toBe(true);
  });

  test('opening the Image tab enters a position-editing mode for the node, and closing the picker clears it again', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-position-mode');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();

    // result — no image editor yet on the solid-fill tab
    expect(await readImageEditor(page)).toBeNull();

    // action — switch to Image, without ever picking a source
    await page.getByLabel('Image').click();

    // result — switching tabs alone (even before a source is picked) enters position-editing mode
    // for this exact node/paint
    await expect.poll(() => readImageEditor(page)).toEqual({ mode: 'position', nodeId: id, paintIndex: 0 });

    // action — close the picker
    await page.keyboard.press('Escape');

    // result — the image editor clears again, but the node's image paint itself is untouched
    await expect.poll(() => readImageEditor(page)).toBeNull();
    expect((await readNode(page, id)).fills?.[0]?.type).toBe('image');
  });

  test('resizing the shape while its Image position-editing mode is active switches it into crop mode', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-mode');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await expect.poll(() => readImageEditor(page)).toEqual({ mode: 'position', nodeId: id, paintIndex: 0 });

    // action — the shape can still be resized exactly as before while the picker is open
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();

    // result — starting that resize switches the image editor from position into crop mode
    await expect.poll(() => readImageEditor(page)).toEqual({ mode: 'crop', nodeId: id, paintIndex: 0 });
  });

  test('resizing the shape while its Image position-editing mode is active also switches the fill mode dropdown to Crop', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-dropdown-sync');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    const panel = page.locator('[class*="ColorPicker_"]').first();
    const fillModeLabel = panel.locator('[class*="ImageFillModeRow__dropdown"] [class*="Dropdown__label"]');

    // before — the dropdown starts on Fill
    await expect(fillModeLabel).toHaveText('Fill');

    // action — resizing the shape switches the editor into crop mode
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();

    // result — the dropdown value follows the internal mode change
    await expect(fillModeLabel).toHaveText('Crop');
  });

  test('resizing the shape while the Image editor is not in crop mode yet leaves the fill mode dropdown untouched otherwise', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-non-crop-dropdown');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    const panel = page.locator('[class*="ColorPicker_"]').first();
    const fillModeLabel = panel.locator('[class*="ImageFillModeRow__dropdown"] [class*="Dropdown__label"]');
    const dropdownTrigger = panel.locator('[class*="ImageFillModeRow__dropdown"]');

    // action — manually pick Fit from the dropdown while still in the default (position) mode, without resizing
    await dropdownTrigger.click();
    await page.getByText('Fit', { exact: true }).click();

    // result — the manual selection is untouched, no resize happened to force it to Crop
    await expect(fillModeLabel).toHaveText('Fit');
  });

  test('manually picking Crop from the dropdown enters crop mode immediately, without needing a resize first', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-manual-crop-pick');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'position' });

    const panel = page.locator('[class*="ColorPicker_"]').first();
    const dropdownTrigger = panel.locator('[class*="ImageFillModeRow__dropdown"]');

    // action — pick Crop from the dropdown directly, with no resize at all
    await dropdownTrigger.click();
    await page.getByText('Crop', { exact: true }).click();

    // result — the underlying editor actually switched to crop mode, not just the dropdown label
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id });

    // result — dragging inside the shape now works right away, no resize needed first
    await designPage.pointerDown(800, 280);
    await designPage.pointerMove(820, 300);
    await designPage.pointerUp();

    const node = await readNode(page, id);

    expect(node.fills?.[0].crop).toEqual({ height: node.height, rotation: 0, width: node.width, x: node.x! + 20, y: node.y! + 20 });
  });

  test('dragging inside the shape while in crop mode selects and moves the image independently of the frame', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-drag-image');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode by grabbing the frame's own nw resize handle
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id });

    const frameBefore = await readNode(page, id);

    // action — drag inside the shape body, away from any resize/rotate handle
    await designPage.pointerDown(800, 280);
    await designPage.pointerMove(820, 300);
    await designPage.pointerUp();

    // result — the click selected the image as the target, and the drag moved only its own crop rect
    const imageEditor = await readImageEditor(page);

    expect(imageEditor?.selectedTarget).toBe('image');

    const frameAfter = await readNode(page, id);
    const crop = frameAfter.fills?.[0].crop;

    expect(crop).toEqual({
      height: frameBefore.height,
      rotation: 0,
      width: frameBefore.width,
      x: frameBefore.x! + 20,
      y: frameBefore.y! + 20,
    });

    // result — the frame itself never moved, proving the two are not coupled
    expect(frameAfter.x).toBe(frameBefore.x);
    expect(frameAfter.y).toBe(frameBefore.y);
  });

  test('dragging the image within its frame snaps to center/edge alignment with the frame, like a smart guide', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-move-smart-guides');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode via the frame's own nw resize handle — frame/crop become (720,220,180,140)
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id });

    // shift the image well clear of the frame first, so nothing starts already aligned
    await designPage.pointerDown(800, 280);
    await designPage.pointerMove(850, 330);
    await designPage.pointerUp();
    expect((await readNode(page, id)).fills?.[0].crop).toEqual({ height: 140, rotation: 0, width: 180, x: 770, y: 270 });

    // action — drag it back to within 2px of fully overlapping the frame again on both axes
    await designPage.pointerDown(850, 330);
    await designPage.pointerMove(798, 278);
    await designPage.pointerUp();

    // result — snapped flush with the frame (same size, so every edge and the center all coincide at once)
    expect((await readNode(page, id)).fills?.[0].crop).toEqual({ height: 140, rotation: 0, width: 180, x: 720, y: 220 });
  });

  test('clicking the frame outside the moved image switches the selected target back to frame', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-reselect-frame');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();

    // move the image well away from the frame's own top-left corner
    await designPage.pointerDown(800, 280);
    await designPage.pointerMove(850, 330);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ selectedTarget: 'image' });

    // action — click near the frame's own corner, now clear of the shifted image rect
    await designPage.click(725, 225);

    // result
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id, selectedTarget: 'frame' });
  });

  test('clicking the frame after focusing the image reopens the fill picker panel (regression: swapping to the dedicated ImageCrop panel while the image was focused unmounted FillRow, dropping its open picker state so it stayed closed after switching back)', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-refocus-frame-reopens-panel');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode via the frame's own nw resize handle
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id });

    const panel = page.locator('[class*="ColorPicker_"]').first();

    await expect(panel).toBeVisible();

    // action — focus the image and move it away from the frame's own corner, swapping the right
    // panel to the dedicated ImageCrop view (a plain click would still land inside the crop rect,
    // which still exactly overlaps the frame at this point, and re-arm a move instead of switching back)
    await designPage.pointerDown(800, 280);
    await designPage.pointerMove(850, 330);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ selectedTarget: 'image' });

    // result — the fill picker panel is gone while the image is focused, as expected
    await expect(panel).not.toBeVisible();

    // action — click near the frame's own corner, now clear of the shifted image rect
    await designPage.click(725, 225);
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id, selectedTarget: 'frame' });

    // result — the picker panel reappears on its own, still on the Image tab, without a swatch click
    await expect(panel).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rotate image' })).toBeVisible();
  });

  test('pressing Escape while the image is focused fully exits the editor but still reopens the fill picker panel (regression: same FillRow-unmount issue as the frame-refocus case, but for a true exit — the crop handles must stay gone while only the panel comes back)', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-escape-while-focused-reopens-panel');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode and focus the image
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await designPage.pointerDown(800, 280);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ selectedTarget: 'image' });

    const panel = page.locator('[class*="ColorPicker_"]').first();

    await expect(panel).not.toBeVisible();

    // action
    await page.keyboard.press('Escape');

    // result — a true exit: the editor is fully null, no crop UI armed on canvas, node stays selected
    await expect.poll(() => readImageEditor(page)).toBeNull();
    expect(await readSelectedIds(page)).toEqual([id]);

    // result — yet the fill picker panel still comes back on its own
    await expect(panel).toBeVisible();
  });

  test('reopening the Image tab after a crop was already committed re-enters crop mode immediately, not position', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-reopen-dropdown');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode, then commit an actual crop by dragging the image
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await designPage.pointerDown(800, 280);
    await designPage.pointerMove(820, 300);
    await designPage.pointerUp();

    // fully close the panel: first Escape exits the editor, second deselects the node
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect.poll(() => readImageEditor(page)).toBeNull();

    // reselect the shape and reopen the picker — it opens back on the Image tab automatically,
    // since the fill is already an image paint
    await designPage.click(800, 280);
    await page.getByLabel('Hex color').click();

    const panel = page.locator('[class*="ColorPicker_"]').first();
    const fillModeLabel = panel.locator('[class*="ImageFillModeRow__dropdown"] [class*="Dropdown__label"]');

    // result — the dropdown reflects the persisted crop immediately, without needing another resize
    await expect(fillModeLabel).toHaveText('Crop');
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop' });
  });

  test('reselecting a node after a crop was committed does not silently rewrite the paint (regression: seeding the panel from the existing paint made it look like a brand new file was just picked, wiping the crop and rotation)', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-reselect-no-rewrite');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    await page.locator('input[type="file"]').setInputFiles({
      buffer: await createSolidColorPngBuffer(40, 40, [255, 0, 0]),
      mimeType: 'image/png',
      name: 'source.png',
    });

    // enter crop mode, then commit an actual crop by dragging the image
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await designPage.pointerDown(800, 280);
    await designPage.pointerMove(820, 300);
    await designPage.pointerUp();

    const cropBefore = (await readNode(page, id)).fills![0].crop;

    expect(cropBefore).toBeDefined();

    // fully close the panel: first Escape exits the editor, second deselects the node
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect.poll(() => readImageEditor(page)).toBeNull();

    // action — reselect the shape and reopen the picker, exactly as a user checking their work would
    await designPage.click(800, 280);
    await page.getByLabel('Hex color').click();

    // result — merely reselecting/reopening must not re-run the "just picked a new file" paint
    // conversion: the crop rect and scaleMode must survive untouched
    const paintAfter = (await readNode(page, id)).fills![0];

    expect(paintAfter.crop).toEqual(cropBefore);
    expect(paintAfter.scaleMode).toBe('fill');
  });

  test('hovering the image crop rect handles while the image is the selected target shows resize/rotate cursors', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-cursors');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode and select the image as the target (a plain click, no drag)
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await designPage.click(800, 280);
    await expect.poll(() => readImageEditor(page)).toMatchObject({ selectedTarget: 'image' });

    const frame = await readNode(page, (await readFirstNodeId(page)) as string);
    const cropRect = { height: frame.height!, width: frame.width!, x: frame.x!, y: frame.y! };

    // before — the plain default cursor, away from any handle
    await page.mouse.move(cropRect.x + cropRect.width / 2, cropRect.y + cropRect.height / 2);
    const defaultCursor = await designPage.cursorStyle();

    // action — hover exactly on the crop rect's own nw corner handle
    await page.mouse.move(cropRect.x, cropRect.y);

    // result — a distinct custom cursor image is applied, not the plain default
    await expect.poll(() => designPage.cursorStyle()).toContain('url(');

    const resizeCursor = await designPage.cursorStyle();

    expect(resizeCursor).not.toBe(defaultCursor);

    // action — hover just outside that same corner, inside the rotate ring. The rotate cursor's
    // own image asset loads lazily (createCursorRotator draws it once HTMLImageElement.complete
    // is true) and hasn't necessarily been requested yet this session, so the very first hover
    // here can resolve to no cursor at all until it finishes loading — nudge the pointer again
    // once it's had time to load, the same way continuous real mouse movement naturally would.
    await page.mouse.move(cropRect.x - 5, cropRect.y - 5);
    await page.waitForTimeout(200);
    await page.mouse.move(cropRect.x - 4, cropRect.y - 5);
    await page.mouse.move(cropRect.x - 5, cropRect.y - 5);

    // result — a different custom cursor image than the resize one
    await expect.poll(() => designPage.cursorStyle()).toContain('url(');

    const rotateCursor = await designPage.cursorStyle();

    expect(rotateCursor).not.toBe(defaultCursor);
    expect(rotateCursor).not.toBe(resizeCursor);
  });

  test('pressing Escape first exits the Image editor mode, keeping the node selected and the panel open, and only a second Escape deselects', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-escape-two-stage');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await expect.poll(() => readImageEditor(page)).toEqual({ mode: 'position', nodeId: id, paintIndex: 0 });

    const panel = page.locator('[class*="ColorPicker_"]').first();

    await expect(panel).toBeVisible();

    // action — first Escape
    await page.keyboard.press('Escape');

    // result — the image editor mode exits, but the node stays selected and the panel stays open
    await expect.poll(() => readImageEditor(page)).toBeNull();
    expect(await readSelectedIds(page)).toEqual([id]);
    await expect(panel).toBeVisible();

    // action — second Escape
    await page.keyboard.press('Escape');

    // result — now it behaves as before: the node gets deselected
    await expect.poll(() => readSelectedIds(page)).toEqual([]);
  });

  test('clicking outside the element first exits the Image editor mode, keeping the node selected and the panel open, and only a second click deselects', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-click-outside-two-stage');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await expect.poll(() => readImageEditor(page)).toEqual({ mode: 'position', nodeId: id, paintIndex: 0 });

    const panel = page.locator('[class*="ColorPicker_"]').first();

    await expect(panel).toBeVisible();

    // action — first click on empty canvas, away from the shape
    await designPage.click(1100, 500);

    // result — the image editor mode exits, but the node stays selected and the panel stays open
    await expect.poll(() => readImageEditor(page)).toBeNull();
    expect(await readSelectedIds(page)).toEqual([id]);
    await expect(panel).toBeVisible();

    // action — second click on empty canvas
    await designPage.click(1100, 500);

    // result — now it behaves as before: the node gets deselected
    await expect.poll(() => readSelectedIds(page)).toEqual([]);
  });

  test('resizing the shape while the Image position-editing mode is active keeps the picker panel open', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-resize-keeps-panel-open');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await expect.poll(() => readImageEditor(page)).toEqual({ mode: 'position', nodeId: id, paintIndex: 0 });

    const panel = page.locator('[class*="ColorPicker_"]').first();

    await expect(panel).toBeVisible();

    // action — drag the shape's own top-left resize handle
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();

    // result — the mode switches to crop, and the panel is not dismissed by the resize interaction
    await expect.poll(() => readImageEditor(page)).toEqual({ mode: 'crop', nodeId: id, paintIndex: 0 });
    expect(await readSelectedIds(page)).toEqual([id]);
    await expect(panel).toBeVisible();
  });

  test('clicking directly on the shape while the Image position-editing mode is active keeps the picker panel open', async ({ page }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-body-click-keeps-panel-open');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await expect.poll(() => readImageEditor(page)).toEqual({ mode: 'position', nodeId: id, paintIndex: 0 });

    const panel = page.locator('[class*="ColorPicker_"]').first();

    await expect(panel).toBeVisible();

    // action — a plain click on the shape's own body, dead center, clear of any resize handle
    await designPage.click(800, 280);

    // result — still selected, still in position mode, and the panel is not dismissed
    await expect.poll(() => readImageEditor(page)).toEqual({ mode: 'position', nodeId: id, paintIndex: 0 });
    expect(await readSelectedIds(page)).toEqual([id]);
    await expect(panel).toBeVisible();
  });

  test('dragging a resize handle past the opposite anchor mirrors the image, and dragging it back un-mirrors it (regression: the mirror stuck on when the drag returned, because the code skipped re-dispatching fills whenever the freshly computed value happened to match the original)', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-mirror-resize-round-trip');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 800, 300);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await page.locator('input[type="file"]').setInputFiles({
      buffer: await createSplitColorPngBuffer(40, [255, 0, 0], [0, 0, 255]),
      mimeType: 'image/png',
      name: 'source.png',
    });

    await expect
      .poll(async () => {
        const node = await readNode(page, id);

        return node.fills?.[0];
      })
      .toMatchObject({ type: 'image' });

    // exit the Image editor's position-editing mode first — otherwise the very next resize-handle
    // drag would auto-enter crop mode instead of resizing the frame, a separate, already-known gap
    await page.keyboard.press('Escape');
    await expect.poll(() => readImageEditor(page)).toBeNull();

    // action — drag the east handle (x=800) past the west anchor (x=700), to x=650: a "mirror" resize
    await designPage.pointerDown(800, 250);
    await designPage.pointerMove(650, 250);
    await designPage.pointerUp();

    // result — the image content actually mirrored, not just the box geometry
    expect((await readNode(page, id)).fills?.[0].flipX).toBe(true);

    // action — drag the same (now west) handle back out past the anchor again, restoring the box
    await designPage.pointerDown(650, 250);
    await designPage.pointerMove(800, 250);
    await designPage.pointerUp();

    // result — the mirror is fully undone, not stuck on from the first drag
    const node = await readNode(page, id);

    expect(node).toMatchObject({ width: 100, x: 700 });
    expect(node.fills?.[0].flipX).toBeFalsy();
  });

  test('a second image-filled shape renders correctly alongside the first, and both survive deselecting (regression: a_texCoord was left enabled after the first image’s draw, so the second image’s stencil mask failed validation and never painted, leaving its fill invisible)', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-two-image-fills-render');
    await expect(designPage.canvas).toBeVisible();

    // shape A, red image fill
    await designPage.drawRectangle(700, 200, 800, 300);

    const idA = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await page.locator('input[type="file"]').setInputFiles({
      buffer: await createSolidColorPngBuffer(20, 20, [255, 0, 0]),
      mimeType: 'image/png',
      name: 'red.png',
    });

    await expect.poll(async () => (await readNode(page, idA)).fills?.[0]).toMatchObject({ type: 'image' });
    await expect.poll(async () => readPixelColor(page, 750, 250)).toEqual([255, 0, 0]);

    // shape B, blue image fill — drawing it deselects A and selects B instead
    await designPage.drawRectangle(850, 200, 950, 300);

    const [idB] = await readSelectedIds(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await page.locator('input[type="file"]').setInputFiles({
      buffer: await createSolidColorPngBuffer(20, 20, [0, 0, 255]),
      mimeType: 'image/png',
      name: 'blue.png',
    });

    await expect.poll(async () => (await readNode(page, idB)).fills?.[0]).toMatchObject({ type: 'image' });

    // result — both shapes render their own image correctly, at the same time, while B is selected
    await expect.poll(async () => readPixelColor(page, 750, 250)).toEqual([255, 0, 0]);
    await expect.poll(async () => readPixelColor(page, 900, 250)).toEqual([0, 0, 255]);

    // action — deselect everything (Escape exits the image editor first, a second click on empty
    // canvas then clears the selection)
    await page.keyboard.press('Escape');
    await designPage.click(500, 500);
    await expect.poll(() => readSelectedIds(page)).toEqual([]);

    // result — neither fill disappeared after deselecting
    await expect.poll(async () => readPixelColor(page, 750, 250)).toEqual([255, 0, 0]);
    await expect.poll(async () => readPixelColor(page, 900, 250)).toEqual([0, 0, 255]);
  });

  test('dragging a resize handle past the opposite anchor mirrors a pattern fill too, and dragging it back un-mirrors it', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-pattern-mirror-resize-round-trip');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 800, 300);

    const targetId = await readFirstNodeId(page);

    // a small green source rectangle to tile
    await designPage.drawRectangle(1000, 200, 1020, 220);

    await page.evaluate(async () => {
      const { store } = await import('/src/store/index.ts');
      const { updateNode } = await import('/src/store/design/slice.ts');
      const { activePageId, pages } = store.getState().design;
      const id = pages[activePageId].rootOrder[1];

      store.dispatch(updateNode({ changes: { fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }, id }));
    });

    // reselect the target rectangle, then pick the green rectangle as its pattern source
    await designPage.canvas.click({ position: { x: 750, y: 250 } });
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Pattern').click();
    await page.getByRole('button', { name: 'Select source...' }).click();
    await designPage.canvas.click({ position: { x: 1010, y: 210 } });

    await expect
      .poll(async () => (await readNode(page, targetId)).fills?.[0])
      .toMatchObject({ sourceNodeId: expect.any(String), type: 'pattern' });
    await expect.poll(() => readSelectedIds(page)).toEqual([targetId]);

    // action — drag the east handle (x=800) past the west anchor (x=700), to x=650: a "mirror" resize
    await designPage.pointerDown(800, 250);
    await designPage.pointerMove(650, 250);
    await designPage.pointerUp();

    // result — the pattern paint actually mirrored, not just the box geometry
    expect((await readNode(page, targetId)).fills?.[0].flipX).toBe(true);

    // action — drag it back out past the anchor again, restoring the box
    await designPage.pointerDown(650, 250);
    await designPage.pointerMove(800, 250);
    await designPage.pointerUp();

    // result — the mirror is fully undone, not stuck on from the first drag
    const node = await readNode(page, targetId);

    expect(node).toMatchObject({ width: 100, x: 700 });
    expect(node.fills?.[0].flipX).toBeFalsy();
  });

  test("clicking a completely different shape while the Image editor's position mode is active exits the editor without selecting that other shape (regression: the fix originally only covered crop mode — position mode had no such guard at all, so the click fell through to the normal selection resolvers and selected the other shape instead)", async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-position-click-other-shape');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // a second, unrelated shape elsewhere on the canvas
    await designPage.drawRectangle(1000, 200, 1100, 300);

    // reselect the first shape, then open its Image editor — no resize, so it stays in 'position' mode
    await designPage.pointerDown(800, 280);
    await designPage.pointerUp();
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'position', nodeId: id });

    // action — click squarely on the other shape's own body
    await designPage.pointerDown(1050, 250);
    await designPage.pointerUp();

    // result — the editor closes, but selection never moved to the other shape
    await expect.poll(() => readImageEditor(page)).toBeNull();
    expect(await readSelectedIds(page)).toEqual([id]);
  });

  test('clicking a completely different shape while crop mode is active exits the editor without selecting that other shape', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-click-other-shape');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    // a second, unrelated shape elsewhere on the canvas
    await designPage.drawRectangle(1000, 200, 1100, 300);

    // reselect the first shape, then enter its Image editor's crop mode
    await designPage.pointerDown(800, 280);
    await designPage.pointerUp();
    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id });

    // action — click squarely on the other shape's own body
    await designPage.pointerDown(1050, 250);
    await designPage.pointerUp();

    // result — the editor closes, but selection never moved to the other shape
    await expect.poll(() => readImageEditor(page)).toBeNull();
    expect(await readSelectedIds(page)).toEqual([id]);
  });

  test("rotating the frame while its image editor is active in crop mode leaves the crop untouched (regression: rotating the frame dragged the crop's own rotation/position along with it)", async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-rotate-frame');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode via the frame's own nw resize handle — the frame becomes (720,220,180,140)
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id });

    const cropBefore = (await readNode(page, id)).fills![0].crop!;

    // action — grab the frame's own rotate handle (just outside its nw corner, 10px diagonally),
    // and spin it exactly 90deg around the frame's own center (810,290) — (890,190) is (710,210)
    // rotated 90deg around that same pivot
    await designPage.pointerDown(710, 210);
    await designPage.pointerMove(890, 190);
    await designPage.pointerUp();

    // result — the frame actually rotated (proving the gesture engaged), but the crop stayed
    // exactly as it was
    const node = await readNode(page, id);

    expect(node.rotation).not.toBeCloseTo(0);
    expect(node.fills?.[0].crop).toEqual(cropBefore);
  });

  test('resizing the frame again while its image editor is already in crop mode leaves the crop untouched (regression: resizing the frame scaled the crop along with it, even though the image was supposed to stay fixed once crop mode was active)', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-resize-frame-again');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode via the frame's own nw resize handle — the frame (and seeded crop) become
    // (720,220,180,140)
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id });

    // select the image as the target with a plain click, then shrink the crop via its own se
    // handle (which starts out coincident with the frame's own se corner) down to half size —
    // this pulls the crop's own corner away from the frame's, so the next click on the frame's
    // real corner can't be mistaken for a click inside the (now smaller) crop rect
    await designPage.pointerDown(800, 280);
    await designPage.pointerUp();
    await designPage.pointerDown(900, 360);
    await designPage.pointerMove(810, 290);
    await designPage.pointerUp();

    const cropBefore = (await readNode(page, id)).fills![0].crop!;

    expect(cropBefore).toEqual({ height: 70, rotation: 0, width: 90, x: 720, y: 220 });

    // reselect the frame as the target via a click on its own body, clear of the shrunken crop
    await designPage.pointerDown(850, 330);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ selectedTarget: 'frame' });

    // action — resize the frame itself from its own (now crop-clear) se corner
    await designPage.pointerDown(900, 360);
    await designPage.pointerMove(950, 400);
    await designPage.pointerUp();

    // result — the frame grew, but the crop stayed exactly as it was
    const node = await readNode(page, id);

    expect(node).toMatchObject({ height: 180, width: 230, x: 720, y: 220 });
    expect(node.fills?.[0].crop).toEqual(cropBefore);
  });

  test("rotating the frame via the right panel's rotation button while its image editor is active in crop mode still carries the crop along, matching how the panel's X/Y and resize fields already stay in lockstep with the frame (only a canvas rotate-handle drag decouples them)", async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-panel-rotate');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode via the frame's own nw resize handle — the frame (and seeded crop) become
    // (720,220,180,140)
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id });

    const editorBeforeRotate = await readImageEditor(page);

    expect(editorBeforeRotate?.selectedTarget).not.toBe('image');

    // action — rotate the frame 90° via the panel's own rotate button, not a canvas drag
    await page.getByLabel('Rotate 90° right').click();

    // result — the crop rotated right along with the frame, unlike a canvas drag
    const node = await readNode(page, id);

    expect(node.rotation).toBe(90);
    expect(node.fills?.[0].crop).toMatchObject({ height: 140, rotation: 90, width: 180 });
  });

  test("the ImageCrop panel's Dimensions row shows the aspect-ratio lock permanently on and disabled, and editing width scales height to match", async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-dimensions-lock');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode via the frame's own nw resize handle — the frame (and seeded crop) become
    // (720,220,180,140)
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id });

    // select the image as the target so the panel swaps to the dedicated ImageCrop view
    await designPage.pointerDown(800, 280);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ selectedTarget: 'image' });

    // result — the lock is on and can't be turned off
    const lockButton = page.getByLabel('Unlock aspect ratio');

    await expect(lockButton).toBeVisible();
    await expect(lockButton).toBeDisabled();

    // action — halving the width from the panel
    const widthInput = page.locator('[data-test-text-field-input="width"]');

    await widthInput.click();
    await widthInput.fill('90');
    await widthInput.press('Enter');

    // result — height scaled down to match the same 180:140 ratio
    const node = await readNode(page, id);

    expect(node.fills?.[0].crop).toMatchObject({ height: 70, width: 90 });
  });

  test("clicking Flip horizontal in the ImageCrop panel flips the image's own paint, not the frame (regression: the flip buttons stayed wired to the frame even while editing its image)", async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-fill-section-image-editor-crop-flip-button');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawRectangle(700, 200, 900, 360);

    const id = await readFirstNodeId(page);

    await page.getByLabel('Hex color').click();
    await page.getByLabel('Image').click();

    // enter crop mode via the frame's own nw resize handle
    await designPage.pointerDown(700, 200);
    await designPage.pointerMove(720, 220);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ mode: 'crop', nodeId: id });

    // select the image as the target so the panel swaps to the dedicated ImageCrop view
    await designPage.pointerDown(800, 280);
    await designPage.pointerUp();
    await expect.poll(() => readImageEditor(page)).toMatchObject({ selectedTarget: 'image' });

    const frameBefore = await readNode(page, id);

    // action
    await page.getByLabel('Flip horizontal').click();

    // result — the paint flipped, the frame's own geometry and rotation stayed exactly as they were
    const node = await readNode(page, id);

    expect(node.fills?.[0].flipX).toBe(true);
    expect(node).toMatchObject({ height: frameBefore.height, width: frameBefore.width, x: frameBefore.x, y: frameBefore.y });
  });
});
