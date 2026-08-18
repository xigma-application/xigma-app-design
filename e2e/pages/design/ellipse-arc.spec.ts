import { test, expect } from '@playwright/test';

// components
import { DesignPage } from './DesignPage';

const waitForCursorClassName = async (designPage: DesignPage, x: number, y: number, expected: string): Promise<string> => {
  for (let attempt = 0; attempt < 20; attempt++) {
    await designPage.pointerMove(x + (attempt % 2), y);

    const className = await designPage.cursorClassName();

    if (className.includes(expected)) {
      return className;
    }
  }

  throw new Error(`"${expected}" cursor class never applied`);
};

test('dragging the Sweep (end-angle) handle cuts a piece out of the ellipse', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-ellipse-arc-sweep');
  await expect(designPage.canvas).toBeVisible();

  // 150x150 circle, box (900, 300) -> (1050, 450), center (975, 375), radius 75; the default
  // arcEndAngle (90°) puts the Sweep handle at the east rim point (1050, 375)
  await designPage.drawEllipse(900, 300, 1050, 450);
  await designPage.click(975, 375);
  await designPage.pointerMove(1400, 700); // rest away from the shape
  const uncut = await designPage.canvas.screenshot();

  await designPage.pointerMove(1050, 375); // hover the Sweep handle
  await designPage.pointerDown(1050, 375);
  await designPage.pointerMove(975, 300); // drag to the north rim — cuts a 90° wedge
  await designPage.pointerUp();
  await designPage.pointerMove(1400, 700); // rest away again for a clean comparison
  const cut = await designPage.canvas.screenshot();

  expect(cut.equals(uncut)).toBe(false);
});

test('the Start (rotate) handle shows the radius cursor and actually rotates the cut once dragged', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-ellipse-arc-rotate');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawEllipse(900, 300, 1050, 450);
  await designPage.click(975, 375);

  // cut a 90° wedge first (Sweep handle: east rim -> north rim); arcStartAngle stays at its
  // default (90°, east) — that's where the Start handle now rests, since only arcEndAngle moved
  await designPage.pointerMove(1050, 375);
  await designPage.pointerDown(1050, 375);
  await designPage.pointerMove(975, 300);
  await designPage.pointerUp();

  const className = await waitForCursorClassName(designPage, 1050, 375, 'radius');
  expect(className).toContain('radius');

  await designPage.pointerMove(1400, 700);
  const beforeRotate = await designPage.canvas.screenshot();

  await designPage.pointerMove(1050, 375); // hover the Start handle
  await designPage.pointerDown(1050, 375);
  await designPage.pointerMove(975, 450); // drag to the south rim — rotates the whole wedge 90°
  await designPage.pointerUp();
  await designPage.pointerMove(1400, 700);
  const afterRotate = await designPage.canvas.screenshot();

  expect(afterRotate.equals(beforeRotate)).toBe(false);
});

test('dragging the Ratio handle hollows a ring out of the ellipse', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-ellipse-arc-ratio-thickness');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawEllipse(900, 300, 1050, 450);
  await designPage.click(975, 375);
  await designPage.pointerMove(1400, 700);
  const solid = await designPage.canvas.screenshot();

  // the Ratio handle rests at dead center (975, 375) while arcRatio is 0, even on an uncut circle
  await designPage.pointerMove(975, 375);
  await designPage.pointerDown(975, 375);
  await designPage.pointerMove(940, 410); // drag outward toward the southwest — hollows a ring
  await designPage.pointerUp();
  await designPage.pointerMove(1400, 700);
  const ringed = await designPage.canvas.screenshot();

  expect(ringed.equals(solid)).toBe(false);
});

test('dragging the Ratio handle into the gap swaps which side of the cut is filled', async ({ page }) => {
  const designPage = new DesignPage(page);

  const dragRatioTo = async (projectId: string, target: { x: number; y: number }): Promise<Buffer> => {
    await designPage.goto(projectId);
    await expect(designPage.canvas).toBeVisible();

    await designPage.drawEllipse(900, 300, 1050, 450);
    await designPage.click(975, 375);

    // cut a 90° wedge between the north rim (0°) and the east rim (90°), leaving the majority
    // (270°) of the circle filled
    await designPage.pointerMove(1050, 375);
    await designPage.pointerDown(1050, 375);
    await designPage.pointerMove(975, 300);
    await designPage.pointerUp();

    await designPage.pointerMove(975, 375); // the Ratio handle rests at dead center while arcRatio is 0
    await designPage.pointerDown(975, 375);
    await designPage.pointerMove(target.x, target.y);
    await designPage.pointerUp();
    await designPage.pointerMove(1400, 700);

    return designPage.canvas.screenshot();
  };

  // both points sit ~50px from center (975, 375) on this circle, so they produce the identical
  // arcRatio magnitude — southwest (225° compass) is still inside the filled majority, northeast
  // (45° compass) is inside the cut-away gap; only the angle differs
  const draggedIntoFilledSide = await dragRatioTo('e2e-test-ellipse-arc-ratio-invert-a', { x: 940, y: 410 });
  const draggedIntoGapSide = await dragRatioTo('e2e-test-ellipse-arc-ratio-invert-b', { x: 1010, y: 340 });

  expect(draggedIntoGapSide.equals(draggedIntoFilledSide)).toBe(false);
});
