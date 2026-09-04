import { test, expect, Page } from '@playwright/test';

// components
import { DesignPage } from '../model/DesignPage';

// utils
import { countMismatchedPixels } from '../../utils/compareScreenshots';

type TStoredNode = {
  defaultFill?: unknown;
  fill?: string | null;
  height?: number;
  id: string;
  pathId?: string | null;
  pathStartOffset?: number;
  type: string;
  width?: number;
};

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

// every node on the active page, keyed by id — used to assert bindings (pathId), in-place shape
// conversion (type/fillColor), and node counts (no stray extra node left behind by a mis-wired attach)
const readNodes = (page: Page): Promise<Record<string, TStoredNode>> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages } = store.getState().design;

    return pages[activePageId].nodes as never;
  });

// injects a vector node with hand-built segments/vertices directly, the same way
// vector-shape-builder.spec.ts's injectSplitRectangle/injectRectangleNode do — reconstructing a
// branching vertex (test 3) or a specific segment-authoring direction (test 7) via real Pen/Vector
// Edit Mode gestures is either impossible (a degree-3 join isn't reachable through the tool's normal
// click flow) or too flaky to depend on for a specific internal data shape
const injectVector = (
  page: Page,
  segments: Record<string, { endId: string; startId: string }>,
  vertices: Record<string, { x: number; y: number }>,
): Promise<string> =>
  page.evaluate(
    async ({ segments, vertices }) => {
      const { store } = await import('/src/store/index.ts');
      const { addNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        addNode({
          fillColor: null,
          filledFaceKeys: [],
          name: 'Vector',
          parentId: null,
          rotation: 0,
          segments: Object.fromEntries(
            Object.entries(segments).map(([id, { endId, startId }]) => [id, { endId, id, startId, tangentEnd: null, tangentStart: null }]),
          ),
          strokeColor: '#000000',
          strokeWidth: 1,
          type: 'vector',
          vertexHandleModes: {},
          vertices: Object.fromEntries(Object.entries(vertices).map(([id, point]) => [id, { id, ...point }])),
        } as never),
      );

      const state = store.getState();
      const { rootOrder } = state.design.pages[state.design.activePageId];

      return rootOrder[rootOrder.length - 1];
    },
    { segments, vertices },
  );

// injects a fully-formed text node bound to an existing vector via pathId, bypassing the live
// typing/blur commit flow entirely — deterministic content/fontSize/offset for a pixel-diff
// regression test, matching commitTextNode.ts's own real field set (TEXT_FONT_FAMILY/TEXT_FILL)
const injectPathText = (
  page: Page,
  pathId: string,
  pathStartOffset: number,
  content: string,
  bounds: { height: number; width: number; x: number; y: number },
): Promise<void> =>
  page.evaluate(
    async ({ bounds, content, pathId, pathStartOffset }) => {
      const { store } = await import('/src/store/index.ts');
      const { addNode } = await import('/src/store/design/slice.ts');

      store.dispatch(
        addNode({
          content,
          fill: '#FFFFFF',
          flipX: false,
          flipY: false,
          fontFamily: 'Inter MSDF',
          fontSize: 24,
          height: bounds.height,
          name: 'Text',
          parentId: null,
          pathFlip: false,
          pathId,
          pathStartOffset,
          rotation: 0,
          type: 'text',
          width: bounds.width,
          x: bounds.x,
          y: bounds.y,
        } as never),
      );
    },
    { bounds, content, pathId, pathStartOffset },
  );

// selectedIds (the "second box" invariant) and vectorEditingNodeIds (whether Vector Edit Mode is
// currently entered on anything) — both drive rendering decisions no screenshot diff pins down cleanly
const readDesignState = (page: Page): Promise<{ selectedIds: string[]; vectorEditingNodeIds: string[] }> =>
  page.evaluate(async () => {
    const { store } = await import('/src/store/index.ts');
    const { activePageId, pages, vectorEditingNodeIds } = store.getState().design;

    return { selectedIds: pages[activePageId].selectedIds, vectorEditingNodeIds };
  });

// the min/max bounding box actually spanned by a vector's own rendered vertices — read straight from
// geometry (not the text node's stale x/y/width/height) so a mirror-resize collapse (near-zero span)
// or a flip-flopped final position shows up unambiguously, matching how the real sync code measures it
const readVectorBounds = (page: Page, vectorId: string): Promise<{ height: number; vertexCount: number; width: number }> =>
  page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { getVectorNodeBounds } = await import('/src/utils/canvas/vectorNetwork/getVectorNodeBounds.ts');
    const { getRenderedVectorNode } = await import('/src/components/Design/Canvas/utils/getRenderedVectorNode.ts');
    const { activePageId, pages } = store.getState().design;
    const node = pages[activePageId].nodes[id];
    const bounds = getVectorNodeBounds(getRenderedVectorNode(node as never));

    return {
      height: bounds.height,
      vertexCount: Object.keys((node as never as { vertices: object }).vertices).length,
      width: bounds.width,
    };
  }, vectorId);

const deleteNodeDirectly = (page: Page, nodeId: string): Promise<void> =>
  page.evaluate(async (id) => {
    const { store } = await import('/src/store/index.ts');
    const { deleteNode } = await import('/src/store/design/slice.ts');

    store.dispatch(deleteNode(id));
  }, nodeId);

test('clicking an existing eligible vector with the Text on Path tool attaches text to it instead of drawing a fresh default ellipse', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-attach-existing-vector');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]); // a single straight open segment, drawn with the Pen tool like any other vector

  await designPage.attachTextOnPath(1000, 400); // its own midpoint, right on the stroke

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true'); // attach commits in one gesture, same as a drag-drawn path

  await designPage.typeText('Hi');
  await designPage.click(1500, 700); // click away to commit

  const nodes = await readNodes(page);
  const values = Object.values(nodes);
  const vector = values.find((node) => node.type === 'vector');
  const text = values.find((node) => node.type === 'text');

  expect(text?.pathId).toBe(vector?.id); // bound straight to the pre-existing vector
  expect(values).toHaveLength(2); // no extra ellipse path node was created alongside it
});

test('clicking a plain convertible shape with the Text on Path tool converts it to a vector and attaches in the same gesture', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-attach-convert-shape');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1100, 450);

  const nodesBefore = await readNodes(page);
  const rectangleId = Object.keys(nodesBefore)[0];

  await designPage.attachTextOnPath(1000, 375); // inside the rectangle's own area

  const defaultTool = designPage.toolRadio('default');
  await expect(defaultTool).toHaveAttribute('aria-checked', 'true');

  await designPage.typeText('Hi');
  await designPage.click(1500, 700);

  const nodesAfter = await readNodes(page);
  const converted = nodesAfter[rectangleId];
  const text = Object.values(nodesAfter).find((node) => node.type === 'text');

  expect(converted.type).toBe('vector'); // converted in place, same id
  expect(converted.defaultFill).toBeNull(); // fill stripped so it does not sit as a filled block under the text
  expect(text?.pathId).toBe(rectangleId);
  expect(Object.keys(nodesAfter)).toHaveLength(2); // no separate node was created for the conversion
});

test('clicking a branching (non-chain) vector does not attach — it draws a fresh default ellipse instead, same as clicking empty canvas', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-attach-ineligible-branching-vector');
  await expect(designPage.canvas).toBeVisible();

  // a 3-way "Y" join at a shared center vertex — degree 3, so getVectorChainOrder returns null and
  // Variable Width's own eligibility condition (reused here) already rejects it
  const branchingId = await injectVector(
    page,
    {
      s1: { endId: 'a', startId: 'center' },
      s2: { endId: 'b', startId: 'center' },
      s3: { endId: 'c', startId: 'center' },
    },
    {
      a: { x: 900, y: 300 },
      b: { x: 1100, y: 300 },
      c: { x: 1000, y: 500 },
      center: { x: 1000, y: 400 },
    },
  );

  await designPage.attachTextOnPath(1000, 400); // exactly on the shared center vertex
  await designPage.typeText('Hi');
  await designPage.click(1500, 700);

  const nodes = await readNodes(page);
  const text = Object.values(nodes).find((node) => node.type === 'text');

  expect(text?.pathId).not.toBe(branchingId); // bound to a freshly created path, not the branching vector
  expect(Object.keys(nodes)).toHaveLength(3); // branching vector + new ellipse path + text, all distinct
});

test('dragging past the attach slop disarms the attach and draws a fresh default path, ignoring the vector underneath the click', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-attach-slop-disarm');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]);

  const nodesBefore = await readNodes(page);
  const vectorId = Object.keys(nodesBefore)[0];

  // pointerdown lands exactly on the vector's own midpoint (same point Test 1 attaches from), but
  // this time drags 300+ world units away before releasing — well past TEXT_ON_PATH_ATTACH_SLOP_PX
  await designPage.drawTextOnPath(1000, 400, 1300, 700);
  await designPage.typeText('Hi');
  await designPage.click(1500, 900);

  const nodes = await readNodes(page);
  const text = Object.values(nodes).find((node) => node.type === 'text');

  expect(text?.pathId).not.toBe(vectorId);
  expect(Object.keys(nodes)).toHaveLength(3); // original vector, untouched + a fresh path + its text
});

test("attaching partway along a chain starts reading from the clicked point, not always the chain's own start", async ({ page }) => {
  const designPage = new DesignPage(page);

  // a single straight 200-unit segment from (900,300) to (1100,300)
  await designPage.goto('e2e-test-attach-offset-near-start');
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 300 },
  ]);
  await designPage.attachTextOnPath(910, 300); // 10 units in -> ~0.05 of the chain
  await designPage.typeText('Hi');
  await designPage.click(1500, 700);

  const nearStart = Object.values(await readNodes(page)).find((node) => node.type === 'text');

  await designPage.goto('e2e-test-attach-offset-near-middle');
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 300 },
  ]);
  await designPage.attachTextOnPath(1000, 300); // 100 units in -> ~0.5 of the chain
  await designPage.typeText('Hi');
  await designPage.click(1500, 700);

  const nearMiddle = Object.values(await readNodes(page)).find((node) => node.type === 'text');

  expect(nearStart?.pathStartOffset).toBeCloseTo(0.05, 1);
  expect(nearMiddle?.pathStartOffset).toBeCloseTo(0.5, 1);
});

test('hovering an eligible vector with the Text on Path tool active shows its dedicated cursor, unlike empty canvas', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-attach-hover-cursor');
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]);
  await designPage.selectToolFromDropdown('text', 'Text on path');

  await waitForCursorClassName(designPage, 1000, 400, 'text-on-path'); // hovering the vector's own stroke
  await waitForCursorClassName(designPage, 1400, 800, 'drawing'); // empty canvas -> falls back to the plain draw cursor
});

test('a closed vector chain renders identical curved text regardless of which internal direction its segments were authored in', async ({
  page,
}) => {
  const designPage = new DesignPage(page);
  const corners = {
    v1: { x: 900, y: 300 },
    v2: { x: 1100, y: 300 },
    v3: { x: 1100, y: 450 },
    v4: { x: 900, y: 450 },
  };
  const bounds = { height: 150, width: 200, x: 900, y: 300 };
  const content = 'THE QUICK BROWN FOX JUMPS';

  // every edge authored start->end walking the loop the same way it's drawn (top-left clockwise) —
  // getVectorChainOrder's own walk never has to reverse any of these to stay continuous
  await designPage.goto('e2e-test-chain-direction-consistent');
  const consistentId = await injectVector(
    page,
    {
      s1: { endId: 'v2', startId: 'v1' },
      s2: { endId: 'v3', startId: 'v2' },
      s3: { endId: 'v4', startId: 'v3' },
      s4: { endId: 'v1', startId: 'v4' },
    },
    corners,
  );
  await injectPathText(page, consistentId, 0, content, bounds);

  const consistentRender = await designPage.canvas.screenshot();

  // identical rectangle, identical rendered path/content — but the right edge (v2->v3) is authored
  // backwards (startId v3, endId v2), so the chain walk has to reverse just that one segment to stay
  // continuous past the top-right corner; this is exactly the mixed reversed/forward topology
  // getVectorChainPositionAtLength mishandled before the fix (see getVectorChainPositionAtLength.ts)
  await designPage.goto('e2e-test-chain-direction-mixed');
  const mixedId = await injectVector(
    page,
    {
      s1: { endId: 'v2', startId: 'v1' },
      s2: { endId: 'v2', startId: 'v3' },
      s3: { endId: 'v4', startId: 'v3' },
      s4: { endId: 'v1', startId: 'v4' },
    },
    corners,
  );
  await injectPathText(page, mixedId, 0, content, bounds);

  const mixedRender = await designPage.canvas.screenshot();

  // a raw Buffer.equals() is the wrong tool here (same reasoning as compareScreenshots.ts's own
  // doc comment): the two segment authorings sample the reversed edge from opposite ends of its own
  // parameterization, so sub-pixel rounding differs even though the two renders are geometrically
  // identical — countMismatchedPixels' antialiasing-aware diff (includeAA: false) is built for exactly
  // this, and a real corner-jump regression would fail it by far more than stray AA noise
  expect(countMismatchedPixels(mixedRender, consistentRender)).toBe(0);
});

test('a vector bound as a Text on Path guide stays hidden until hovered or selected, same as the ellipse guide', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-guide-outline-states');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]);
  await designPage.attachTextOnPath(1000, 400); // text starts reading from exactly this point
  await designPage.typeText('Hi');
  await designPage.click(1500, 700); // commit

  await designPage.pointerMove(950, 450); // inside the bounding box, off the diagonal stroke entirely
  const hiddenBaseline = await designPage.canvas.screenshot();

  await designPage.pointerMove(1000, 400); // directly on the rendered "H"
  const hovered = await designPage.canvas.screenshot();
  expect(hovered.equals(hiddenBaseline)).toBe(false);

  await designPage.pointerMove(950, 450); // move back off the stroke
  const afterLeaving = await designPage.canvas.screenshot();
  expect(afterLeaving.equals(hiddenBaseline)).toBe(true);

  await designPage.click(1000, 400); // select it via the rendered glyph
  await designPage.pointerMove(950, 450); // off the text, still inside the box
  const selectedNotHovered = await designPage.canvas.screenshot();
  expect(selectedNotHovered.equals(hiddenBaseline)).toBe(false);
});

test('duplicating a text-on-vector node (Ctrl+D) carries its own bound vector guide along, correctly rebound', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-guide-duplicate');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]);
  await designPage.attachTextOnPath(1000, 400);
  await designPage.typeText('Hi');
  await designPage.click(1500, 700); // commit, deselected

  await designPage.click(1000, 400); // select the committed text via its rendered glyph
  await page.keyboard.press('Control+d');

  const nodes = await readNodes(page);
  const texts = Object.values(nodes).filter((node) => node.type === 'text');
  const vectors = Object.values(nodes).filter((node) => node.type === 'vector');

  expect(texts).toHaveLength(2);
  expect(vectors).toHaveLength(2); // the guide was duplicated too, not just the text
  expect(texts.every((text) => vectors.some((vector) => vector.id === text.pathId))).toBe(true); // each text still resolves to a real, distinct vector
  expect(texts[0].pathId).not.toBe(texts[1].pathId); // the duplicate is bound to its OWN cloned guide, not sharing the original's
});

test('copying and pasting a text-on-vector node (Ctrl+C / Ctrl+V) carries its own bound vector guide along, correctly rebound', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-guide-copy-paste');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]);
  await designPage.attachTextOnPath(1000, 400);
  await designPage.typeText('Hi');
  await designPage.click(1500, 700);

  await designPage.click(1000, 400);
  await page.keyboard.press('Control+c');
  await designPage.click(1500, 700); // deselect — with a node still selected, Ctrl+V replaces it in
  // place; the duplicate-with-rebound-guide behaviour under test only fires when nothing is selected
  await page.keyboard.press('Control+v');

  const nodes = await readNodes(page);
  const texts = Object.values(nodes).filter((node) => node.type === 'text');
  const vectors = Object.values(nodes).filter((node) => node.type === 'vector');

  expect(texts).toHaveLength(2);
  expect(vectors).toHaveLength(2);
  expect(texts.every((text) => vectors.some((vector) => vector.id === text.pathId))).toBe(true);
  expect(texts[0].pathId).not.toBe(texts[1].pathId);
});

test('selecting a text-on-vector node never also selects its own guide — no stray second selection outline', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-guide-no-second-box');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]);
  await designPage.attachTextOnPath(1000, 400);
  await designPage.typeText('Hi');
  await designPage.click(1500, 700); // commit, deselected

  await designPage.click(1000, 400); // select via the rendered glyph

  const { selectedIds } = await readDesignState(page);
  const text = Object.values(await readNodes(page)).find((node) => node.type === 'text');

  expect(selectedIds).toEqual([text?.id]); // exactly the text — its guide never rides along in selectedIds
});

test("double-clicking a bound vector guide's own stroke does not enter Vector Edit Mode on it", async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-guide-not-editable');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]);
  await designPage.attachTextOnPath(1000, 400);
  await designPage.typeText('Hi');
  await designPage.click(1500, 700); // commit

  // (1080,480) sits on the diagonal stroke, well past where "Hi" reads from (1000,400) — the bare
  // guide contour, not glyph ink
  await designPage.doubleClick(1080, 480);

  const { vectorEditingNodeIds } = await readDesignState(page);
  expect(vectorEditingNodeIds).toEqual([]); // still inert as its own editable vector while bound
});

test('deleting a text-on-vector node also deletes its own bound guide vector', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-guide-cascade-delete-text');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]);
  await designPage.attachTextOnPath(1000, 400);
  await designPage.typeText('Hi');
  await designPage.click(1500, 700);

  await designPage.click(1000, 400); // select the text via its rendered glyph
  await page.keyboard.press('Delete');

  const nodes = await readNodes(page);
  expect(Object.keys(nodes)).toHaveLength(0); // the vector guide went with it, not left orphaned
});

test('deleting a bound guide vector directly also deletes the text bound to it (bidirectional cascade)', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-guide-cascade-delete-vector');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]);
  await designPage.attachTextOnPath(1000, 400);
  await designPage.typeText('Hi');
  await designPage.click(1500, 700);

  const nodesBefore = await readNodes(page);
  const vector = Object.values(nodesBefore).find((node) => node.type === 'vector')!;

  // the guide is inert to an ordinary click-select while bound (fa904c91), so the cascade is exercised
  // directly at the reducer level, the same way cascadeDeletePathTextBinding.spec.ts covers it in unit
  // tests — this is the store-level contract, independent of whether the UI currently exposes a path
  // to select the guide on its own
  await deleteNodeDirectly(page, vector.id);

  const nodesAfter = await readNodes(page);
  expect(Object.keys(nodesAfter)).toHaveLength(0); // the bound text went with it too
});

test('undoing a shape-to-vector text attach peels back the text commit first, then the conversion and fill strip', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-guide-undo-attach');
  await expect(designPage.canvas).toBeVisible();

  await designPage.drawRectangle(900, 300, 1100, 450);
  const originalFill = Object.values(await readNodes(page))[0].fill;
  expect(originalFill).toBeTruthy(); // sanity: the freshly drawn rectangle really does start out filled

  await designPage.attachTextOnPath(1000, 375);
  await designPage.typeText('Hi');
  await designPage.click(1500, 700); // commit: two separate history gestures happened — the attach
  // itself (conversion + fill strip), then the text-content commit — see useCommitTextEdit.ts

  await page.keyboard.press('Control+z'); // undoes the text-content commit only

  const afterFirstUndo = await readNodes(page);
  expect(Object.keys(afterFirstUndo)).toHaveLength(1); // the typed text node is gone
  const stillConverted = Object.values(afterFirstUndo)[0];
  expect(stillConverted.type).toBe('vector'); // the conversion itself is untouched by this undo
  expect(stillConverted.defaultFill).toBeNull();

  await page.keyboard.press('Control+z'); // undoes the attach gesture itself

  const afterSecondUndo = await readNodes(page);
  const restored = Object.values(afterSecondUndo)[0];
  expect(restored.type).toBe('rectangle'); // back to being a plain rectangle
  expect(restored.fill).toBe(originalFill); // its original fill is back
});

test('resizing the source vector node updates the attached text live, since they are bound by pathId', async ({ page }) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-guide-resize');
  await expect(designPage.canvas).toBeVisible();

  // a Pen-drawn closed rectangle, corners clicked in order and closed back on the first point
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 300 },
    { x: 1100, y: 450 },
    { x: 900, y: 450 },
    { x: 900, y: 300 },
  ]);
  await designPage.selectVectorEditMoveTool(); // exit Vector Edit Mode (Pen leaves it armed after closing the loop)

  await designPage.attachTextOnPath(1000, 300); // top edge, its own midpoint
  await designPage.typeText('Hi');
  await designPage.click(1500, 700); // commit, deselected

  await designPage.click(900, 300); // the rectangle's own "nw" corner — selects the bound pair as one unit
  const beforeResize = await designPage.canvas.screenshot();

  await designPage.pointerDown(900, 300); // "nw" resize handle
  await designPage.pointerMove(800, 200); // enlarge it
  await designPage.pointerUp();

  const afterResize = await designPage.canvas.screenshot();
  expect(afterResize.equals(beforeResize)).toBe(false);
});

test('a mirror-resize past the opposite anchor on both axes keeps the bound vector guide coherent, not collapsed or corrupted', async ({
  page,
}) => {
  const designPage = new DesignPage(page);

  await designPage.goto('e2e-test-vector-guide-mirror-resize');
  await expect(designPage.canvas).toBeVisible();

  // the same 200x200 "nw"(900,300)/"se"(1100,500) box already proven to mirror cleanly for the
  // ellipse guide in text-on-path.spec.ts's own "dragging the path-text offset handle on a mirrored
  // path-text node" fixture — reused here verbatim for the vector-guide case
  await designPage.drawVectorPath([
    { x: 900, y: 300 },
    { x: 1100, y: 500 },
  ]);
  await designPage.attachTextOnPath(1000, 400);
  await designPage.typeText('Hi');
  await designPage.click(1500, 700);

  const vector = Object.values(await readNodes(page)).find((node) => node.type === 'vector')!;
  const before = await readVectorBounds(page, vector.id);

  await designPage.click(1000, 400); // select the bound pair via the rendered glyph
  await designPage.pointerDown(900, 300); // "nw" resize handle
  await designPage.pointerMove(1300, 700); // past the opposite ("se") anchor on both axes -> mirrors flipX and flipY
  await designPage.pointerUp();

  const after = await readVectorBounds(page, vector.id);

  expect(after.vertexCount).toBe(before.vertexCount); // no vertices lost or merged together
  expect(after.width).toBeCloseTo(before.width, 0); // same 200-unit span, not collapsed toward zero
  expect(after.height).toBeCloseTo(before.height, 0);

  const text = Object.values(await readNodes(page)).find((node) => node.type === 'text');
  expect(text).toBeTruthy(); // the text survived the mirror intact, still bound to the same guide
});
