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

test('draws a path with the Text on Path tool and commits a rendered curved text node', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-create');
  await expect(designPage.canvas).toBeVisible();

  const before = await designPage.canvas.screenshot();

  await designPage.drawTextOnPath(300, 300, 450, 420);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  await designPage.typeText('Hello');
  await designPage.click(900, 600); // click away to commit

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('typing tool-shortcut letters while editing text on a path does not switch the active tool', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-shortcut-block');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextOnPath(300, 300, 450, 420);

  // each of these letters is a tool shortcut (r=rectangle, f=frame, o=ellipse, l=line, t=text, h=hand, ...)
  await designPage.typeText('rt frame line oval hand');

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');
});

test('resizing the source path node updates the attached text live, since they are bound by pathId', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-resize');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextOnPath(300, 300, 450, 420);
  await designPage.typeText('HI');
  await designPage.click(900, 600); // click away to commit, deselecting

  await designPage.click(300, 300); // the box's own "nw" corner sits outside the inscribed curve, hits the path node
  const beforeResize = await designPage.canvas.screenshot();

  await designPage.pointerDown(300, 300); // "nw" resize handle
  await designPage.pointerMove(200, 200); // enlarge the path
  await designPage.pointerUp();

  const afterResize = await designPage.canvas.screenshot();
  expect(afterResize.equals(beforeResize)).toBe(false);
});

test('the path outline stays hidden until hovered or selected, and hovering an already-selected path outranks its thin selected style', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-outline-states');
  await expect(designPage.canvas).toBeVisible();

  // a 200x200 circle centered at (400, 400); pathStartOffset defaults to 0, so "Hi" starts at
  // the circle's rightmost point — the rendered "H" glyph itself sits at (493, 405), not the bare
  // curve point (500, 400) (hit-testing follows the glyph ink along the curve, not just the curve)
  await designPage.drawTextOnPath(300, 300, 500, 500);
  await designPage.typeText('Hi');
  await designPage.click(900, 600); // click away to commit

  await designPage.pointerMove(310, 310); // inside the bounding box, but off the curve entirely
  const hiddenBaseline = await designPage.canvas.screenshot();

  await designPage.pointerMove(493, 405); // directly on the rendered "H"
  const hovered = await designPage.canvas.screenshot();
  expect(hovered.equals(hiddenBaseline)).toBe(false);

  await designPage.pointerMove(310, 310); // move back off the curve
  const afterLeaving = await designPage.canvas.screenshot();
  expect(afterLeaving.equals(hiddenBaseline)).toBe(true);

  await designPage.click(493, 405); // select it via a real click on the rendered glyph
  await designPage.pointerMove(310, 310); // move off the text, but stay inside the box
  const selectedNotHovered = await designPage.canvas.screenshot();
  expect(selectedNotHovered.equals(hiddenBaseline)).toBe(false);

  await designPage.pointerMove(493, 405); // hover the text again, while still selected
  const selectedAndHovered = await designPage.canvas.screenshot();
  expect(selectedAndHovered.equals(selectedNotHovered)).toBe(false);
});

test('clicking a point along curved text places the caret there for insertion, not always at the end', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x200 circle centered at (400, 400); "Hi" starts at the rightmost point (500, 400) and
  // its "H"/"i" boundary sits at (499, 410) — clicking there inserts between the two characters
  await designPage.goto('e2e-test-curved-caret-mid-insert');
  await designPage.drawTextOnPath(300, 300, 500, 500);
  await designPage.typeText('Hi');
  await designPage.click(900, 600); // commit
  await designPage.doubleClick(500, 400); // re-enter editing on the rendered "H"
  await designPage.click(499, 410); // the boundary between "H" and "i" on the curve
  await designPage.typeText('X');
  await designPage.click(900, 600); // commit
  const midInsertion = await designPage.canvas.screenshot();

  // same path/content, but the click lands just past "i" (499, 414) — the caret should land at
  // the end instead, producing a visibly different render for the same typed character
  await designPage.goto('e2e-test-curved-caret-end-insert');
  await designPage.drawTextOnPath(300, 300, 500, 500);
  await designPage.typeText('Hi');
  await designPage.click(900, 600);
  await designPage.doubleClick(500, 400);
  await designPage.click(499, 414); // the boundary just past "i" on the curve
  await designPage.typeText('X');
  await designPage.click(900, 600);
  const endInsertion = await designPage.canvas.screenshot();

  expect(midInsertion.equals(endInsertion)).toBe(false);
});

test('dragging along curved text selects a range that typing then replaces', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-curved-caret-drag-select');
  await designPage.drawTextOnPath(300, 300, 500, 500);
  await designPage.typeText('Hi');
  await designPage.click(900, 600); // commit "Hi"

  const withHi = await designPage.canvas.screenshot();

  await designPage.doubleClick(500, 400); // re-enter editing
  await designPage.pointerDown(500, 400); // caret anchored just before "H"
  await designPage.pointerMove(499, 414); // drag along the curve to just past "i" -> selects "Hi"
  await designPage.pointerUp();
  await designPage.typeText('Bye'); // replaces the dragged selection
  await designPage.click(900, 600); // commit

  const withBye = await designPage.canvas.screenshot();
  expect(withBye.equals(withHi)).toBe(false);
});

test('clicking a point on a rotated text-on-path circle places the caret there, following the rotation', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x200 circle centered at (400,400); "Hi" starts at the rightmost point (500,400). Once
  // rotated 180 degrees around that same center, the rendered "H" now sits at the leftmost point
  // (300,400) instead — the opposite side of where it started
  await designPage.goto('e2e-test-rotated-path-caret-mid');
  await designPage.drawTextOnPath(300, 300, 500, 500);
  await designPage.typeText('Hi');
  await designPage.click(900, 600); // commit

  await designPage.click(500, 400); // select it, on the rendered "H"
  await designPage.pointerDown(290, 290); // rotate ring just outside the "nw" handle
  await designPage.pointerMove(510, 510); // the reflection of (290,290) through the circle's own center -> exactly 180 degrees
  await designPage.pointerUp();

  await designPage.doubleClick(400, 400); // re-enter editing at the circle's own (rotation-invariant) center
  await designPage.click(300, 400); // the "H" boundary, now on the opposite side after rotating
  await designPage.typeText('X');
  await designPage.click(900, 600); // commit
  const rotatedInsertion = await designPage.canvas.screenshot();

  // same circle/content, but never rotated — the same screen point (300,400) now sits nowhere
  // near the content (the far side of the circle), so the caret hit-test clamps to the end instead
  await designPage.goto('e2e-test-rotated-path-caret-reference');
  await designPage.drawTextOnPath(300, 300, 500, 500);
  await designPage.typeText('Hi');
  await designPage.click(900, 600);

  await designPage.doubleClick(500, 400);
  await designPage.click(300, 400);
  await designPage.typeText('X');
  await designPage.click(900, 600);
  const unrotatedInsertion = await designPage.canvas.screenshot();

  expect(rotatedInsertion.equals(unrotatedInsertion)).toBe(false);
});

test('dragging the path-text offset handle on a mirrored path-text node grabs it at its actual mirrored position', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x200 circle at (300,300)-(500,500); moving the offset handle off the rightmost point
  // first (to 481,459, ~10% around the curve) avoids the box's own corners/edges, so the later
  // mirrored handle position can't be confused with a resize handle. Dragging the "nw" corner past
  // the opposite ("se") anchor on both axes then mirrors the node (flipX and flipY) and moves the
  // box to (500,500)-(700,700) — the offset handle now belongs at (519,541), not at the unmirrored
  // position (681,659) an unfixed hit-test would still be looking for
  const setUpMirroredPathText = async (): Promise<void> => {
    await designPage.drawTextOnPath(300, 300, 500, 500);
    await designPage.typeText('Hi');
    await designPage.click(900, 600); // commit

    await designPage.click(500, 400); // select it, on the rendered "H"
    await designPage.pointerDown(500, 400); // the offset handle at its initial position
    await designPage.pointerMove(481, 459); // move it off any box corner/edge
    await designPage.pointerUp();

    await designPage.pointerDown(300, 300); // "nw" resize handle
    await designPage.pointerMove(700, 700); // past the opposite anchor on both axes -> mirrors flipX and flipY
    await designPage.pointerUp();
  };

  // scenario A: actually try to grab and drag the handle at its real (mirrored) position
  await designPage.goto('e2e-test-path-offset-handle-mirrored-grab');
  await setUpMirroredPathText();
  await designPage.pointerDown(519, 541); // the handle's actual (mirrored) position
  await designPage.pointerMove(600, 650); // drag it along the curve
  await designPage.pointerUp();
  const grabbed = await designPage.canvas.screenshot();

  // scenario B: identical setup, but only hover the same path (no button held) — this only
  // exercises hover-outline rendering, never an actual offset drag, regardless of hit-test bugs
  await designPage.goto('e2e-test-path-offset-handle-mirrored-hover-only');
  await setUpMirroredPathText();
  await designPage.pointerMove(519, 541);
  await designPage.pointerMove(600, 650);
  const hoveredOnly = await designPage.canvas.screenshot();

  // if the handle hit-test were still looking at the unmirrored position, scenario A's pointerdown
  // would miss it entirely and behave just like scenario B's plain hover — so any difference here
  // can only come from the drag actually grabbing the handle and moving pathStartOffset
  expect(grabbed.equals(hoveredOnly)).toBe(false);
});

test('the path outline renders dashed while actively drawing or editing it, unlike the solid outline once just selected', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-path-outline-dashed-while-editing');
  await designPage.drawTextOnPath(300, 300, 500, 500);
  await designPage.typeText('Hi');

  const whileEditing = await designPage.canvas.screenshot(); // still typing -> dashed outline

  await designPage.click(900, 600); // commit, deselecting
  await designPage.click(500, 400); // select it (not editing) -> solid outline

  const whileSelected = await designPage.canvas.screenshot();

  expect(whileEditing.equals(whileSelected)).toBe(false);
});

test('the path-offset handle stays draggable while actively editing the text, without ending the edit session', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x200 circle centered at (400,400); pathStartOffset defaults to 0, so both "Hi" and its
  // offset handle start at the rightmost point (500,400)
  await designPage.goto('e2e-test-path-offset-handle-during-editing');
  await designPage.drawTextOnPath(300, 300, 500, 500);
  await designPage.typeText('Hi');

  const beforeDrag = await designPage.canvas.screenshot(); // still editing -> dashed outline, "Hi" at the right

  await designPage.pointerDown(500, 400); // the offset handle, not a caret click
  await designPage.pointerMove(400, 300); // drag it toward the top of the circle
  await designPage.pointerUp();

  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(false); // the text visibly moved along the curve

  await designPage.typeText('!'); // proves the edit session is still live, not interrupted by the drag

  const afterFurtherTyping = await designPage.canvas.screenshot();

  expect(afterFurtherTyping.equals(afterDrag)).toBe(false);
});

test('hovering the path-offset handle shows the hand cursor, and dragging it shows the pressing cursor', async ({ page }) => {
  const designPage = new DesignPage(page);

  // own stroke, so clicking there selects the path, not the text. Select via the rendered "H"
  // glyph's actual ink at (493,405) instead (hit-testing follows the glyph, not the bare curve —
  // see the "path outline stays hidden..." test above), then drag the handle off the box's own
  // edge midpoint (which a resize handle also lives at) to the proven-safe (481,459) used by the
  // mirrored-drag test above before checking cursor classes there
  await designPage.goto('e2e-test-path-offset-handle-cursor');
  await designPage.drawTextOnPath(300, 300, 500, 500);
  await designPage.typeText('Hi');
  await designPage.click(900, 600); // commit
  await designPage.click(493, 405); // select the text node, on the rendered "H"

  await designPage.pointerDown(500, 400); // the offset handle, at the bare curve point
  await designPage.pointerMove(481, 459); // move it off the box's edge/corner ambiguity
  await designPage.pointerUp();

  await waitForCursorClassName(designPage, 481, 459, 'hand'); // hover the relocated offset handle

  await designPage.pointerDown(481, 459);
  await waitForCursorClassName(designPage, 450, 490, 'pressing'); // drag it further along the curve

  await designPage.pointerUp();
  await waitForCursorClassName(designPage, 450, 490, 'hand');
});
