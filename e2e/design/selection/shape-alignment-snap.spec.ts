import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

test('dragging a shape within tolerance of another snaps its position flush, rendering identically to placing it there directly', async ({
  page,
}) => {
  const snapped = new DesignPage(page);

  await snapped.goto('e2e-test-shape-alignment-snap-dragged');
  await expect(snapped.canvas).toBeVisible();

  await snapped.drawRectangle(700, 150, 800, 250); // A, 100x100
  await snapped.drawRectangle(823, 150, 923, 250); // B, 100x100, 23px right of A's un-dragged position

  await snapped.pointerDown(750, 200); // A's centre
  await page.mouse.move(770, 200, { steps: 4 }); // raw +20px — A's right edge (820) lands 3px short of B's left edge (823)
  await snapped.pointerUp();
  await snapped.pointerMove(1400, 800); // move away so no hover artifacts differ from the control

  const snappedShot = await snapped.canvas.screenshot();

  const control = new DesignPage(page);

  await control.goto('e2e-test-shape-alignment-snap-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(723, 150, 823, 250); // A placed directly at the snapped (+23px) position
  await control.drawRectangle(823, 150, 923, 250); // B, same as above
  await control.click(773, 200); // re-select A, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await control.canvas.screenshot();

  expect(snappedShot.equals(controlShot)).toBe(true);
});

test('dragging a shape well outside tolerance of another does not snap it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-shape-alignment-snap-no-match');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 150, 800, 250); // A, 100x100
  await designPage.drawRectangle(1000, 150, 1100, 250); // B, 200px away — never within tolerance

  await designPage.pointerDown(750, 200); // A's centre
  await page.mouse.move(770, 200, { steps: 4 }); // raw +20px, nowhere near B
  await designPage.pointerUp();
  await designPage.pointerMove(1400, 800);

  const draggedShot = await designPage.canvas.screenshot();

  const control = new DesignPage(page);

  await control.goto('e2e-test-shape-alignment-snap-no-match-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(720, 150, 820, 250); // A placed directly at the raw (unsnapped) +20px position
  await control.drawRectangle(1000, 150, 1100, 250); // B, same as above
  await control.click(770, 200); // re-select A, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await control.canvas.screenshot();

  expect(draggedShot.equals(controlShot)).toBe(true);
});

// runs at devicePixelRatio 2 (the real target: retina Macs) — a 1px guide sitting exactly on the
// frame edge only resolves to solid pixels at dpr >= 2; at the suite-default dpr 1 it half-covers
// two columns and the diff is below the pixel-equality threshold
test.describe('frame-edge alignment guide', () => {
  test.use({ deviceScaleFactor: 2 });

  test('stays visible where a child dragged inside a frame lines up with the frame edge (guide draws over the drop-target outline)', async ({
    page,
  }) => {
    const designPage = new DesignPage(page);

    await designPage.goto('e2e-test-shape-alignment-snap-frame-edge');
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawFrame(600, 150, 1100, 650);
    await designPage.click(1500, 900);
    await designPage.drawRectangle(760, 200, 860, 300); // rect near the frame's top-left, inside it
    await designPage.click(1500, 900);

    // a clean vertical strip on the frame's left edge, below where the rect ends up
    const edgeStrip = { height: 120, width: 16, x: 592, y: 420 };

    // drag the rect left so its left edge snaps onto the frame's left edge (x=600) — guide expected
    await designPage.pointerDown(810, 250);
    await page.mouse.move(652, 250, { steps: 10 }); // left edge -> ~602, within snap tolerance of 600
    await page.mouse.move(652, 250);
    const withGuide = await page.screenshot({ clip: edgeStrip });

    // drag it to a spot ~30px inside the frame edge — no axis lines up, no guide
    await page.mouse.move(682, 250, { steps: 10 });
    await page.mouse.move(682, 250);
    const withoutGuide = await page.screenshot({ clip: edgeStrip });

    await designPage.pointerUp();

    expect(withGuide.equals(withoutGuide)).toBe(false);
  });
});
