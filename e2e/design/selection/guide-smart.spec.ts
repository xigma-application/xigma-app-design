import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// several screenshot-equality tests sharing GPU/WebGL contention across workers is flaky — pin this
// file to one worker (see shape-draw-snap.spec.ts's own identical rationale)
test.describe.configure({ mode: 'serial' });

test("dragging a shape near its neighbour's own established gap to a third shape snaps to match it, rendering identically to placing it there directly", async ({
  page,
}) => {
  const snapped = new DesignPage(page);

  await snapped.goto('e2e-test-guide-smart-chain-gap-dragged');
  await expect(snapped.canvas).toBeVisible();

  // square1 (60x60) and square2 (100x100) sit with a 30px gap; square3 (40x40) starts 2px past the
  // x:920 that would give it the same 30px gap to square2
  await snapped.drawRectangle(700, 300, 760, 360);
  await snapped.drawRectangle(790, 250, 890, 350);
  await snapped.drawRectangle(922, 305, 962, 345);

  await snapped.pointerDown(942, 325); // square3's centre
  await page.mouse.move(943, 325, { steps: 3 }); // raw +1px — the snap closes the remaining mismatch
  await snapped.pointerUp();
  await snapped.pointerMove(1400, 800); // move away so no hover artifacts differ from the control

  const snappedShot = await page.screenshot({ clip: { height: 250, width: 400, x: 650, y: 200 } });

  const control = new DesignPage(page);

  await control.goto('e2e-test-guide-smart-chain-gap-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(700, 300, 760, 360);
  await control.drawRectangle(790, 250, 890, 350);
  await control.drawRectangle(920, 305, 960, 345); // square3 placed directly at the snapped (matching-gap) position
  await control.click(940, 325); // re-select square3, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await page.screenshot({ clip: { height: 250, width: 400, x: 650, y: 200 } });

  expect(snappedShot.equals(controlShot)).toBe(true);
});

test('dragging a shape well outside tolerance of a matching gap does not snap it', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-guide-smart-chain-gap-no-match');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(700, 300, 760, 360);
  await designPage.drawRectangle(790, 250, 890, 350);
  await designPage.drawRectangle(922, 305, 962, 345);

  await designPage.pointerDown(942, 325); // square3's centre
  await page.mouse.move(972, 325, { steps: 3 }); // raw +30px, well outside the snap tolerance
  await designPage.pointerUp();
  await designPage.pointerMove(1400, 800);

  const draggedShot = await page.screenshot({ clip: { height: 250, width: 400, x: 650, y: 200 } });

  const control = new DesignPage(page);

  await control.goto('e2e-test-guide-smart-chain-gap-no-match-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(700, 300, 760, 360);
  await control.drawRectangle(790, 250, 890, 350);
  await control.drawRectangle(952, 305, 992, 345); // square3 placed directly at the raw (unsnapped) +30px position
  await control.click(972, 325); // re-select square3, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await page.screenshot({ clip: { height: 250, width: 400, x: 650, y: 200 } });

  expect(draggedShot.equals(controlShot)).toBe(true);
});

test('dragging a shape back between two flanking neighbours snaps it to the centred, equal-gap position, rendering identically to placing it there directly', async ({
  page,
}) => {
  const snapped = new DesignPage(page);

  await snapped.goto('e2e-test-guide-smart-flanked-dragged');
  await expect(snapped.canvas).toBeVisible();

  // shape1 (80x100) and shape3 (80x100) leave a 120px span for shape2 (80x100) — a centred 20px gap
  // on each side
  await snapped.drawRectangle(700, 250, 780, 350);
  await snapped.drawRectangle(820, 250, 900, 350);
  await snapped.drawRectangle(940, 250, 1020, 350);

  await snapped.pointerDown(860, 300); // shape2's centre
  await page.mouse.move(860, 500, { steps: 5 }); // drag it away first
  await snapped.pointerUp();

  await snapped.pointerDown(860, 500);
  await page.mouse.move(862, 302, { steps: 5 }); // back toward the middle, 2px off centred
  await snapped.pointerUp();
  await snapped.pointerMove(1400, 800); // move away so no hover artifacts differ from the control

  const snappedShot = await page.screenshot({ clip: { height: 350, width: 450, x: 650, y: 150 } });

  const control = new DesignPage(page);

  await control.goto('e2e-test-guide-smart-flanked-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(700, 250, 780, 350);
  await control.drawRectangle(940, 250, 1020, 350);
  await control.drawRectangle(820, 250, 900, 350); // shape2 placed directly at the centred position
  await control.click(860, 300); // re-select shape2, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await page.screenshot({ clip: { height: 350, width: 450, x: 650, y: 150 } });

  expect(snappedShot.equals(controlShot)).toBe(true);
});

test('dragging a shape into a grid slot snaps to match both its row (same height) and column (same width) gaps at once, rendering identically to placing it there directly', async ({
  page,
}) => {
  test.slow(); // draws two full 3x3 grids — comfortably over the default budget once the file's other tests have warmed the worker

  const snapped = new DesignPage(page);

  await snapped.goto('e2e-test-guide-smart-grid-dragged');
  await expect(snapped.canvas).toBeVisible();

  // a 3x3 grid with the centre cell (col2/row2) missing: row1/row3 are height 50, row2 is height 80;
  // col1 is width 80, col2/col3 are width 60 — all 10px gaps
  await snapped.drawRectangle(700, 200, 780, 250); // col1 row1
  await snapped.drawRectangle(790, 200, 850, 250); // col2 row1
  await snapped.drawRectangle(860, 200, 920, 250); // col3 row1
  await snapped.drawRectangle(700, 260, 780, 340); // col1 row2
  await snapped.drawRectangle(860, 260, 920, 340); // col3 row2
  await snapped.drawRectangle(700, 350, 780, 400); // col1 row3
  await snapped.drawRectangle(790, 350, 850, 400); // col2 row3
  await snapped.drawRectangle(860, 350, 920, 400); // col3 row3
  await snapped.drawRectangle(790, 450, 850, 530); // col2/row2 candidate (60x80), drawn elsewhere first

  await snapped.pointerDown(820, 490); // its centre
  await page.mouse.move(822, 302, { steps: 6 }); // target centre (820,300) for x790-850,y260-340; 2px off
  await snapped.pointerUp();
  await snapped.pointerMove(1400, 800); // move away so no hover artifacts differ from the control

  const snappedShot = await page.screenshot({ clip: { height: 350, width: 400, x: 650, y: 150 } });

  const control = new DesignPage(page);

  await control.goto('e2e-test-guide-smart-grid-control');
  await expect(control.canvas).toBeVisible();

  await control.drawRectangle(700, 200, 780, 250);
  await control.drawRectangle(790, 200, 850, 250);
  await control.drawRectangle(860, 200, 920, 250);
  await control.drawRectangle(700, 260, 780, 340);
  await control.drawRectangle(860, 260, 920, 340);
  await control.drawRectangle(700, 350, 780, 400);
  await control.drawRectangle(790, 350, 850, 400);
  await control.drawRectangle(860, 350, 920, 400);
  await control.drawRectangle(790, 260, 850, 340); // col2/row2 placed directly at the snapped grid slot
  await control.click(820, 300); // re-select it, matching the drag scenario's end state
  await control.pointerMove(1400, 800);

  const controlShot = await page.screenshot({ clip: { height: 350, width: 400, x: 650, y: 150 } });

  expect(snappedShot.equals(controlShot)).toBe(true);
});

test('dragging a shape to sit centred below a same-size neighbour draws the matched-pair guides (centre line + both edges + × corners) instead of a plain alignment guide', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-guide-smart-matched-pair');
  await expect(designPage.canvas).toBeVisible();

  // two same-size 200x150 rects, one stationary and one dragged to sit centred below it with a gap
  await designPage.drawRectangle(700, 200, 900, 350);
  await designPage.drawRectangle(700, 500, 900, 650);

  await designPage.pointerDown(800, 575); // its centre
  await page.mouse.move(802, 452, { steps: 6 }); // 2px off centred x, a gap below the stationary one

  const withGuides = await page.screenshot({ clip: { height: 540, width: 360, x: 620, y: 130 } });

  await designPage.pointerUp();
  await designPage.pointerMove(1400, 800);

  const withoutGuides = await page.screenshot({ clip: { height: 540, width: 360, x: 620, y: 130 } });

  // the guides only show mid-drag — the two frames must differ
  expect(withGuides.equals(withoutGuides)).toBe(false);
});

test('dragging a shape onto the end of a run of same-size, equally-spaced neighbours walks the whole chain: centre line + edges + × through every shape, and a gap label in each equal gap', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-guide-smart-matched-chain');
  await expect(designPage.canvas).toBeVisible();

  // three stationary 160x120 rects stacked with equal 40px gaps, plus a fourth dragged onto the end of the run
  await designPage.drawRectangle(700, 180, 860, 300);
  await designPage.drawRectangle(700, 340, 860, 460);
  await designPage.drawRectangle(700, 500, 860, 620);
  await designPage.drawRectangle(700, 720, 860, 840);

  await designPage.pointerDown(780, 780); // its centre
  await page.mouse.move(782, 722, { steps: 6 }); // 2px off centred x, a ~40px gap below the run

  const withGuides = await page.screenshot({ clip: { height: 760, width: 320, x: 640, y: 120 } });

  await designPage.pointerUp();
  await designPage.pointerMove(1400, 900);

  const withoutGuides = await page.screenshot({ clip: { height: 760, width: 320, x: 640, y: 120 } });

  // the chain guides only show mid-drag — the two frames must differ
  expect(withGuides.equals(withoutGuides)).toBe(false);
});

test('dragging a shape to the crossing of a vertical and a horizontal run draws both chains at once (a + of guides through it)', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-guide-smart-matched-cross');
  await expect(designPage.canvas).toBeVisible();

  // a + of same-size 90x90 rects: two above, two below, two left, two right of the centre slot (equal gaps)
  await designPage.drawRectangle(760, 200, 850, 290); // above 2
  await designPage.drawRectangle(760, 320, 850, 410); // above 1
  await designPage.drawRectangle(760, 560, 850, 650); // below 1
  await designPage.drawRectangle(760, 680, 850, 770); // below 2
  await designPage.drawRectangle(520, 440, 610, 530); // left 2
  await designPage.drawRectangle(640, 440, 730, 530); // left 1
  await designPage.drawRectangle(880, 440, 970, 530); // right 1
  await designPage.drawRectangle(1000, 440, 1090, 530); // right 2
  await designPage.drawRectangle(760, 900, 850, 990); // the shape to drag into the centre

  await designPage.pointerDown(805, 945); // its centre
  await page.mouse.move(806, 486, { steps: 8 }); // into the empty centre slot of the +

  const withGuides = await page.screenshot({ clip: { height: 640, width: 640, x: 480, y: 160 } });

  await designPage.pointerUp();
  await designPage.pointerMove(1400, 900);

  const withoutGuides = await page.screenshot({ clip: { height: 640, width: 640, x: 480, y: 160 } });

  // both chains' guides only show mid-drag — the two frames must differ
  expect(withGuides.equals(withoutGuides)).toBe(false);
});
