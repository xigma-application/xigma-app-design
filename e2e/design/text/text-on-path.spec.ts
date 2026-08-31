import { test, expect } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

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

const waitForResizeCursor = async (designPage: DesignPage, x: number, y: number): Promise<string> => {
  for (let attempt = 0; attempt < 20; attempt++) {
    await designPage.pointerMove(x + (attempt % 2), y);

    const cursor = await designPage.cursorStyle();

    if (cursor) {
      return cursor;
    }
  }

  throw new Error('resize cursor never applied');
};

test('draws a path with the Text on Path tool and commits a rendered curved text node', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-create');
  await expect(designPage.canvas).toBeVisible();

  const before = await designPage.canvas.screenshot();

  await designPage.drawTextOnPath(900, 300, 1050, 420);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  await designPage.typeText('Hello');
  await designPage.click(1500, 600); // click away to commit

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('starts editing with a default 100x100 path, top-left anchored at the click point, when clicked without dragging', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-click-default');
  await expect(designPage.canvas).toBeVisible();

  const before = await designPage.canvas.screenshot();

  await designPage.selectToolFromDropdown('text', 'Text on path');
  await designPage.click(900, 300);

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  // still enters edit mode, seeded with the default path, exactly like a drag-created text-on-path node
  await designPage.typeText('Hi');
  await designPage.click(1500, 600); // click away to commit

  const after = await designPage.canvas.screenshot();
  expect(after.equals(before)).toBe(false);
});

test('clearing all content on an existing text-on-path node and blurring deletes it, instead of leaving the original content untouched', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-path-text-clear-to-empty');
  await expect(designPage.canvas).toBeVisible();

  // a 200x200 circle centered at (1000,400); "Hi" starts at the top (1000,300)
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600); // commit

  const withText = await designPage.canvas.screenshot();

  await designPage.doubleClick(1000, 300); // re-enter edit mode on the rendered "H", all content selected
  await page.keyboard.press('Backspace'); // clear to empty
  await designPage.click(1500, 600); // blur with no content

  const afterClearing = await designPage.canvas.screenshot();

  // reference: draw a fresh path and click away with no content typed at all — the already-
  // established "never created" render for a first-time draw. Comparing against a totally
  // untouched page instead would be misleading here: the toolbar's shared text/text-on-path button
  // remembers whichever was used last (lastTextTool, same mechanic as lastShapeTool), so a page that
  // used Text on Path always renders that icon differently from one that never touched the tool at
  // all, regardless of whether the node itself was deleted
  await designPage.goto('e2e-test-path-text-clear-to-empty-reference');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.click(1500, 600);

  const neverCreated = await designPage.canvas.screenshot();

  expect(afterClearing.equals(withText)).toBe(false);
  expect(afterClearing.equals(neverCreated)).toBe(true);
});

test('pressing Escape while typing fresh path-text with content commits it and leaves it selected, unlike a plain blur which deselects', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-path-text-escape-select-new');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await page.keyboard.press('Escape');
  await designPage.pointerMove(1500, 700); // rest the pointer somewhere neutral before capturing —
  // Escape never moves the mouse, so the hover outline (independent of selection) would otherwise
  // depend on wherever the previous gesture happened to leave it (see TEST_CASES.md's "Gotcha for
  // other e2e tests")

  const afterEscape = await designPage.canvas.screenshot();

  // reference: commit the identical path via a normal blur (deselects), then manually click the
  // rendered "H" to select it the ordinary way — the known-correct "selected" render to compare
  await designPage.goto('e2e-test-path-text-escape-select-new-reference');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600); // commit via blur, deselecting
  await designPage.click(1005, 300); // select it via a plain click on the rendered "H"
  await designPage.pointerMove(1500, 700);

  const manuallySelected = await designPage.canvas.screenshot();

  expect(afterEscape.equals(manuallySelected)).toBe(true);
});

test('pressing Escape while drawing a fresh path with no text discards it, same as blurring it away empty', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-path-text-escape-discard-empty');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await page.keyboard.press('Escape');

  const afterEscape = await designPage.canvas.screenshot();

  // reference: the already-established blur-based discard (draw with no text, then click away) —
  // comparing against a totally untouched page instead would be misleading here, for the same
  // lastTextTool toolbar-memory reason noted in the "clearing all content" test above
  await designPage.goto('e2e-test-path-text-escape-discard-empty-reference');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.click(1500, 600);

  const afterBlur = await designPage.canvas.screenshot();

  expect(afterEscape.equals(afterBlur)).toBe(true);
});

test('pressing Escape while re-editing an existing path-text node exits editing and selects it; a second Escape then deselects it', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-path-text-escape-existing');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600); // commit, deselected
  await designPage.pointerMove(1500, 700);

  const committedDeselected = await designPage.canvas.screenshot();

  await designPage.doubleClick(1000, 300); // re-enter editing, on the rendered "H"
  await page.keyboard.press('Escape'); // first Escape: exits editing, stays selected
  await designPage.pointerMove(1500, 700); // Escape never moves the mouse, so rest it back at the
  // same neutral point before every capture below — see the note in the test above

  const afterFirstEscape = await designPage.canvas.screenshot();

  expect(afterFirstEscape.equals(committedDeselected)).toBe(false);

  await page.keyboard.press('Escape'); // second Escape: deselects
  await designPage.pointerMove(1500, 700);

  const afterSecondEscape = await designPage.canvas.screenshot();

  expect(afterSecondEscape.equals(committedDeselected)).toBe(true);

  // reference: confirm afterFirstEscape genuinely matches a real "selected" render
  await designPage.goto('e2e-test-path-text-escape-existing-reference');
  await expect(designPage.canvas).toBeVisible();
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600);
  await designPage.click(1005, 300);
  await designPage.pointerMove(1500, 700);

  const manuallySelected = await designPage.canvas.screenshot();

  expect(afterFirstEscape.equals(manuallySelected)).toBe(true);
});

test('typing tool-shortcut letters while editing text on a path does not switch the active tool', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-shortcut-block');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextOnPath(900, 300, 1050, 420);

  // each of these letters is a tool shortcut (r=rectangle, f=frame, o=ellipse, l=line, t=text, h=hand, ...)
  await designPage.typeText('rt frame line oval hand');

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');
});

test('resizing the source path node updates the attached text live, since they are bound by pathId', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-resize');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawTextOnPath(900, 300, 1050, 420);
  await designPage.typeText('HI');
  await designPage.click(1500, 600); // click away to commit, deselecting

  await designPage.click(900, 300); // the box's own "nw" corner sits outside the inscribed curve, hits the path node
  const beforeResize = await designPage.canvas.screenshot();

  await designPage.pointerDown(900, 300); // "nw" resize handle
  await designPage.pointerMove(800, 200); // enlarge the path
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

  // a 200x200 circle centered at (1000, 400); pathStartOffset defaults to 0.75, so "Hi" starts at
  // the circle's top — the rendered "H" glyph itself sits at (1005, 300), not the bare
  // curve point (1000, 300) (hit-testing follows the glyph ink along the curve, not just the curve)
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600); // click away to commit

  await designPage.pointerMove(910, 310); // inside the bounding box, but off the curve entirely
  const hiddenBaseline = await designPage.canvas.screenshot();

  await designPage.pointerMove(1005, 300); // directly on the rendered "H"
  const hovered = await designPage.canvas.screenshot();
  expect(hovered.equals(hiddenBaseline)).toBe(false);

  await designPage.pointerMove(910, 310); // move back off the curve
  const afterLeaving = await designPage.canvas.screenshot();
  expect(afterLeaving.equals(hiddenBaseline)).toBe(true);

  await designPage.click(1005, 300); // select it via a real click on the rendered glyph
  await designPage.pointerMove(910, 310); // move off the text, but stay inside the box
  const selectedNotHovered = await designPage.canvas.screenshot();
  expect(selectedNotHovered.equals(hiddenBaseline)).toBe(false);

  await designPage.pointerMove(1005, 300); // hover the text again, while still selected
  const selectedAndHovered = await designPage.canvas.screenshot();
  expect(selectedAndHovered.equals(selectedNotHovered)).toBe(false);
});

test('clicking a point along curved text places the caret there for insertion, not always at the end', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x200 circle centered at (1000, 400); "Hi" starts at the top (1000, 300) and
  // its "H"/"i" boundary sits at (1010, 301) — clicking there inserts between the two characters
  await designPage.goto('e2e-test-curved-caret-mid-insert');
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600); // commit
  await designPage.doubleClick(1000, 300); // re-enter editing on the rendered "H"
  await designPage.click(1010, 301); // the boundary between "H" and "i" on the curve
  await designPage.typeText('X');
  await designPage.click(1500, 600); // commit
  const midInsertion = await designPage.canvas.screenshot();

  // same path/content, but the click lands just past "i" (1019, 302) — the caret should land at
  // the end instead, producing a visibly different render for the same typed character
  await designPage.goto('e2e-test-curved-caret-end-insert');
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600);
  await designPage.doubleClick(1000, 300);
  await designPage.click(1019, 302); // the boundary just past "i" on the curve
  await designPage.typeText('X');
  await designPage.click(1500, 600);
  const endInsertion = await designPage.canvas.screenshot();

  expect(midInsertion.equals(endInsertion)).toBe(false);
});

test('double-clicking a word while actively typing path-text selects it, so typing replaces just that word', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x200 circle centered at (1000, 400); "Hi there" starts at the top (1000, 300),
  // same as the plain "Hi" fixture above — the rendered "H" glyph sits at (1005, 300)
  await designPage.goto('e2e-test-path-word-select');
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi there');

  await designPage.doubleClick(1005, 300); // select "Hi" on the rendered "H", still actively typing (never committed)
  await designPage.typeText('Yo');
  await designPage.click(1500, 600); // commit

  const replaced = await designPage.canvas.screenshot();

  await designPage.goto('e2e-test-path-word-select-reference');
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Yo there');
  await designPage.click(1500, 600);

  const reference = await designPage.canvas.screenshot();

  expect(replaced.equals(reference)).toBe(true);
});

test('dragging along curved text selects a range that typing then replaces', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-curved-caret-drag-select');
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600); // commit "Hi"

  const withHi = await designPage.canvas.screenshot();

  await designPage.doubleClick(1000, 300); // re-enter editing
  await designPage.pointerDown(1000, 300); // caret anchored just before "H"
  await designPage.pointerMove(1019, 302); // drag along the curve to just past "i" -> selects "Hi"
  await designPage.pointerUp();
  await designPage.typeText('Bye'); // replaces the dragged selection
  await designPage.click(1500, 600); // commit

  const withBye = await designPage.canvas.screenshot();
  expect(withBye.equals(withHi)).toBe(false);
});

test('clicking a point on a rotated text-on-path circle places the caret there, following the rotation', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x200 circle centered at (1000,400); "Hi" starts at the top (1000,300). Once
  // rotated 180 degrees around that same center, the rendered "H" now sits at the bottom
  // (1000,500) instead — the opposite side of where it started
  await designPage.goto('e2e-test-rotated-path-caret-mid');
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600); // commit

  await designPage.click(1000, 300); // select it, on the rendered "H"
  await designPage.pointerDown(890, 290); // rotate ring just outside the "nw" handle
  await designPage.pointerMove(1110, 510); // the reflection of (890,290) through the circle's own center -> exactly 180 degrees
  await designPage.pointerUp();

  await designPage.doubleClick(1000, 400); // re-enter editing at the circle's own (rotation-invariant) center
  await designPage.click(990, 499); // the "H" boundary, now on the opposite side after rotating
  await designPage.typeText('X');
  await designPage.click(1500, 600); // commit
  const rotatedInsertion = await designPage.canvas.screenshot();

  // same circle/content, but never rotated — the same screen point (990,499) now sits nowhere
  // near the content (the far side of the circle), so the caret hit-test clamps to the end instead
  await designPage.goto('e2e-test-rotated-path-caret-reference');
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600);

  await designPage.doubleClick(1000, 300);
  await designPage.click(990, 499);
  await designPage.typeText('X');
  await designPage.click(1500, 600);
  const unrotatedInsertion = await designPage.canvas.screenshot();

  expect(rotatedInsertion.equals(unrotatedInsertion)).toBe(false);
});

test('dragging the path-text offset handle on a mirrored path-text node grabs it at its actual mirrored position', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x200 circle at (900,300)-(1100,500); moving the offset handle off the rightmost point
  // first (to 1081,459, ~10% around the curve) avoids the box's own corners/edges, so the later
  // mirrored handle position can't be confused with a resize handle. Dragging the "nw" corner past
  // the opposite ("se") anchor on both axes then mirrors the node (flipX and flipY) and moves the
  // box to (1100,500)-(1300,700) — the offset handle now belongs at (1119,541), not at the
  // unmirrored position (1281,659) an unfixed hit-test would still be looking for
  const setUpMirroredPathText = async (): Promise<void> => {
    await designPage.drawTextOnPath(900, 300, 1100, 500);
    await designPage.typeText('Hi');
    await designPage.click(1500, 600); // commit

    await designPage.click(1000, 300); // select it, on the rendered "H"
    await designPage.pointerDown(1000, 300); // the offset handle at its initial position
    await designPage.pointerMove(1081, 459); // move it off any box corner/edge
    await designPage.pointerUp();

    await designPage.pointerDown(900, 300); // "nw" resize handle
    await designPage.pointerMove(1300, 700); // past the opposite anchor on both axes -> mirrors flipX and flipY
    await designPage.pointerUp();
  };

  // scenario A: actually try to grab and drag the handle at its real (mirrored) position
  await designPage.goto('e2e-test-path-offset-handle-mirrored-grab');
  await setUpMirroredPathText();
  await designPage.pointerDown(1119, 541); // the handle's actual (mirrored) position
  await designPage.pointerMove(1200, 650); // drag it along the curve
  await designPage.pointerUp();
  const grabbed = await designPage.canvas.screenshot();

  // scenario B: identical setup, but only hover the same path (no button held) — this only
  // exercises hover-outline rendering, never an actual offset drag, regardless of hit-test bugs
  await designPage.goto('e2e-test-path-offset-handle-mirrored-hover-only');
  await setUpMirroredPathText();
  await designPage.pointerMove(1119, 541);
  await designPage.pointerMove(1200, 650);
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
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');

  const whileEditing = await designPage.canvas.screenshot(); // still typing -> dashed outline

  await designPage.click(1500, 600); // commit, deselecting
  await designPage.click(1000, 300); // select it (not editing) -> solid outline

  const whileSelected = await designPage.canvas.screenshot();

  expect(whileEditing.equals(whileSelected)).toBe(false);
});

test('the path-offset handle stays draggable while actively editing the text, without ending the edit session', async ({ page }) => {
  const designPage = new DesignPage(page);

  // a 200x200 circle centered at (1000,400); pathStartOffset defaults to 0.75, so both "Hi" and its
  // offset handle start at the top of the circle (1000,300)
  await designPage.goto('e2e-test-path-offset-handle-during-editing');
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');

  const beforeDrag = await designPage.canvas.screenshot(); // still editing -> dashed outline, "Hi" at the top

  await designPage.pointerDown(1000, 300); // the offset handle, not a caret click
  await designPage.pointerMove(1100, 400); // drag it toward the right of the circle
  await designPage.pointerUp();

  const afterDrag = await designPage.canvas.screenshot();

  expect(afterDrag.equals(beforeDrag)).toBe(false); // the text visibly moved along the curve

  await designPage.typeText('!'); // proves the edit session is still live, not interrupted by the drag

  const afterFurtherTyping = await designPage.canvas.screenshot();

  expect(afterFurtherTyping.equals(afterDrag)).toBe(false);
});

test('does not apply a resize cursor at the path corner for a freshly typed path-text node that was never explicitly selected', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-text-on-path-no-stale-resize-cursor');

  // warm up the lazily-decoded resize-cursor image on an unrelated node first, away from
  // everywhere else this test looks (same reason resize.spec.ts's own #43 test nudges the pointer
  // repeatedly: the very first resize-cursor hover in a cold page can take close to a second to
  // decode, and nothing re-applies it without a further pointermove) — otherwise the "no resize
  // cursor while unselected" check below could read empty for the wrong reason (image not decoded
  // yet), not the real one (nothing is actually selected)
  await designPage.drawRectangle(650, 50, 700, 100);
  await designPage.click(675, 75);
  await waitForResizeCursor(designPage, 650, 50);
  await designPage.click(1500, 800); // deselect the warm-up rectangle

  // a 200x200 circle centered at (1000, 400); the rendered "H" glyph sits at (1005, 300), same
  // fixture as the "path outline stays hidden..." test above. Commit by blurring onto the
  // toolbar's own (already-checked) default-tool button, not a canvas click — clicking empty
  // canvas would itself dispatch setSelection([]) via the ordinary selection tool and mask
  // whether the commit itself left a stale selection behind
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.toolRadio('default').click(); // commit, without ever explicitly selecting the node

  await designPage.pointerMove(1500, 900); // clear any lingering cursor state first
  await designPage.pointerMove(900, 300); // where the "nw" resize handle would sit if the node were selected
  await designPage.pointerMove(901, 300); // one more nudge so a real cursor change has a chance to apply

  expect(await designPage.cursorStyle()).toBe('');

  await designPage.click(1005, 300); // now genuinely select it, on the rendered "H"
  await designPage.pointerMove(1500, 900); // clear cursor state again before re-hovering

  const resizeCursorWhileSelected = await waitForResizeCursor(designPage, 900, 300); // proves this point is a real resize handle once actually selected
  expect(resizeCursorWhileSelected).not.toBe('');
});

test('hovering the path-offset handle shows the hand cursor, and dragging it shows the pressing cursor', async ({ page }) => {
  const designPage = new DesignPage(page);

  // own stroke, so clicking there selects the path, not the text. Select via the rendered "H"
  // glyph's actual ink at (1093,405) instead (hit-testing follows the glyph, not the bare curve —
  // see the "path outline stays hidden..." test above), then drag the handle off the box's own
  // edge midpoint (which a resize handle also lives at) to the proven-safe (1081,459) used by the
  // mirrored-drag test above before checking cursor classes there
  await designPage.goto('e2e-test-path-offset-handle-cursor');
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');
  await designPage.click(1500, 600); // commit
  await designPage.click(1005, 300); // select the text node, on the rendered "H"

  await designPage.pointerDown(1000, 300); // the offset handle, at the bare curve point
  await designPage.pointerMove(1081, 459); // move it off the box's edge/corner ambiguity
  await designPage.pointerUp();

  await waitForCursorClassName(designPage, 1081, 459, 'hand'); // hover the relocated offset handle

  await designPage.pointerDown(1081, 459);
  await waitForCursorClassName(designPage, 1050, 490, 'pressing'); // drag it further along the curve

  await designPage.pointerUp();
  await waitForCursorClassName(designPage, 1050, 490, 'hand');
});

test('typing path-text with no active selection shows a ribbon outline around the whole typed content', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-curved-editing-outline');
  await designPage.drawTextOnPath(900, 300, 1100, 500);

  const beforeTyping = await designPage.canvas.screenshot(); // empty content -> nothing to outline yet

  await designPage.typeText('Hi');
  const afterTyping = await designPage.canvas.screenshot(); // the outline now traces the typed content

  expect(afterTyping.equals(beforeTyping)).toBe(false);
});

test('does not show the container "W x H" size badge while actively typing fresh path-text', async ({ page }) => {
  // useDrawTextOnPathTool.ts selects the draft path node (setSelection([pathNodeId])) purely so the
  // dashed "editing" outline above can resolve before the real text node exists yet — drawScene.ts
  // used to hand that still-selected path straight to drawSelectionSizeLabel, so the container's own
  // "W x H" badge kept rendering below it for as long as typing continued, a real reported regression
  const designPage = new DesignPage(page);

  // a strip a few pixels below the 200x200 draft box's bottom edge (700,300)-(1100,500) — clear of
  // both the box body/outline and the corner resize handles, wide enough to catch the badge centered
  // under the box but narrow enough to skip everything else
  const belowBoxArea = { height: 40, width: 100, x: 950, y: 510 };

  await designPage.goto('e2e-test-text-on-path-no-size-badge');
  await designPage.drawTextOnPath(900, 300, 1100, 500);
  await designPage.typeText('Hi');

  const whileEditing = await page.screenshot({ clip: belowBoxArea });

  // control: a plain rectangle drawn at the exact same box, left selected — its own "200 x 200"
  // badge renders in this same strip, proving the strip really does capture the badge when one exists
  const control = new DesignPage(page);

  await control.goto('e2e-test-text-on-path-no-size-badge-control');
  await control.drawRectangle(900, 300, 1100, 500);

  const controlWithBadge = await page.screenshot({ clip: belowBoxArea });

  expect(whileEditing.equals(controlWithBadge)).toBe(false);
});
