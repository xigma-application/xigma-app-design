// store
import { addNode, moveNodes, setImageEditor, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { AlignmentLayout, LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TImagePaint, TPatternPaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getRotatedAnchorSolver } from '../../getRotatedAnchorSolver';
import { resizeBoxNode } from '../resizeBoxNode';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 50,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addAutoLayoutFrameNode = (heightSizingMode?: SizingMode, widthSizingMode?: SizingMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 100,
      heightSizingMode,
      horizontalGap: 10,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      widthSizingMode,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectNode = (width: number, height: number): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
      height,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addImageRectangle = (crop: { height: number; rotation: number; width: number; x: number; y: number }): string => {
  store.dispatch(
    addNode({
      fills: [{ crop, opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addImageRectangleNoCrop = (): string => {
  store.dispatch(
    addNode({
      fills: [{ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addPatternRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [
        {
          alignmentIndex: 0,
          direction: 'horizontal',
          offsetX: 0,
          offsetY: 0,
          opacity: 100,
          scale: 100,
          spacingX: 0,
          spacingY: 0,
          tileType: 'rectangular',
          type: 'pattern',
        },
      ],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addMediaNode = (): string => {
  store.dispatch(
    addNode({
      flipX: false,
      flipY: false,
      height: 100,
      name: 'Image',
      parentId: null,
      rotation: 0,
      src: 'a.png',
      type: NodeType.media,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('resizeBoxNode', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should resize a single unrotated node using the plain (non-solver) position formula', () => {
    // mock
    const idA = addFrameNode();

    // before
    resizeBoxNode(
      idA,
      { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      1.5,
      1.6,
      true,
      null,
    );

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({
      height: 80,
      width: 150,
      x: 0,
      y: 0,
    });
  });

  it('should toggle flip when the drag crosses the anchor', () => {
    // mock
    const idMedia = addMediaNode();

    // before — negative scaleX signals a crossed anchor on the X axis only
    resizeBoxNode(
      idMedia,
      { flip: { x: false, y: false }, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: null },
      -0.3,
      1,
      true,
      null,
    );

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idMedia]).toMatchObject({ flipX: true, flipY: false });
  });

  it('should use the rotated anchor solver for a single rotated node, when one is provided', () => {
    // mock
    const idA = addFrameNode();
    const solver = getRotatedAnchorSolver({ height: 50, width: 100, x: 0, y: 0 }, 'e', 90, 2, 1);

    // before
    resizeBoxNode(
      idA,
      { flip: null, height: 50, rotation: 90, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: null },
      2,
      1,
      true,
      solver,
    );

    // result — matches getRotatedAnchorSolver's own directly-verified output for these inputs
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as {
      height: number;
      width: number;
      x: number;
      y: number;
    };

    expect(node).toMatchObject({ height: 50, width: 200 });
    expect(node.x).toBeCloseTo(-50);
    expect(node.y).toBeCloseTo(50);
  });

  it("should project the world scale onto a rotated GROUP member's own local axes, not use it raw", () => {
    // mock
    const idA = addFrameNode();

    // before — no solver (group path); scaleX=2/scaleY=1 in world space, member rotated 90deg
    resizeBoxNode(
      idA,
      { flip: null, height: 50, rotation: 90, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: null },
      2,
      1,
      false,
      null,
    );

    // result — matches the end-to-end "grow a rotated GROUP MEMBER..." case in continueResizeDrag.spec.ts
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({
      height: 100,
      width: 100,
      x: 50,
      y: -25,
    });
  });

  it('should reflow an auto-layout frame’s children live, in the same dispatch, when the frame itself is resized', () => {
    // mock — a horizontal, right-packed auto-layout frame with two children
    const frameId = addAutoLayoutFrameNode();
    const idA = addRectNode(30, 20);
    const idB = addRectNode(40, 20);

    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(updateNode({ changes: { layoutAlignment: AlignmentLayout.topRight }, id: frameId }));

    // before — the frame widens from 100 to 200, anchored at its own top-left corner
    resizeBoxNode(
      frameId,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      2,
      1,
      true,
      null,
    );

    // result — right-packed content (30+10+40=80) re-anchors against the new, wider right edge
    const page = selectActivePage(store.getState());
    expect(page.nodes[frameId]).toMatchObject({ width: 200 });
    expect(page.nodes[idA]).toMatchObject({ x: 120 });
    expect(page.nodes[idB]).toMatchObject({ x: 160 });
  });

  it('should reflow an auto-layout frame’s other children live, in the same dispatch, when one child is resized', () => {
    // mock — a horizontal auto-layout frame with two children, left-packed (the default)
    const frameId = addAutoLayoutFrameNode();
    const idA = addRectNode(30, 20);
    const idB = addRectNode(40, 20);

    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: frameId }));

    // before — child a doubles in width (30 -> 60)
    resizeBoxNode(idA, { flip: null, height: 20, rotation: 0, width: 30, x: 0, y: 0 }, store.dispatch, { x: 0, y: 0 }, 2, 1, true, null);

    // result — b is pushed along by a's new width, without being resized itself
    const page = selectActivePage(store.getState());
    expect(page.nodes[idA]).toMatchObject({ width: 60 });
    expect(page.nodes[idB]).toMatchObject({ width: 40, x: 70 });
  });

  it('should switch the width axis back to fixed when a hugging auto-layout frame is resized by dragging its width', () => {
    // mock — horizontal flow: width is the primary axis
    const frameId = addAutoLayoutFrameNode(undefined, SizingMode.hug);

    // before
    resizeBoxNode(
      frameId,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      2,
      1,
      true,
      null,
    );

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ width: 200, widthSizingMode: SizingMode.fixed });
  });

  it('should switch the height axis back to fixed when a hugging auto-layout frame is resized by dragging its height', () => {
    // mock — horizontal flow: height is the counter axis
    const frameId = addAutoLayoutFrameNode(SizingMode.hug);

    // before
    resizeBoxNode(
      frameId,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      1,
      1.5,
      true,
      null,
    );

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ height: 150, heightSizingMode: SizingMode.fixed });
  });

  it('should clamp the resized width down to the node’s own maxWidth', () => {
    // mock
    const idA = addFrameNode();

    store.dispatch(updateNode({ changes: { maxWidth: 120 }, id: idA }));

    // before — scaleX2 would otherwise grow width to 200
    resizeBoxNode(idA, { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 }, store.dispatch, { x: 0, y: 0 }, 2, 1, true, null);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({ width: 120 });
  });

  it('should clamp the resized height up to the node’s own minHeight', () => {
    // mock
    const idA = addFrameNode();

    store.dispatch(updateNode({ changes: { minHeight: 90 }, id: idA }));

    // before — scaleY0.5 would otherwise shrink height to 25
    resizeBoxNode(idA, { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 }, store.dispatch, { x: 0, y: 0 }, 1, 0.5, true, null);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({ height: 90 });
  });

  it('should scale an image fill’s crop rect along with the node, so it stays attached instead of resetting', () => {
    // mock — a 100x100 node doubling in width only, anchored at its own top-left corner; the crop
    // rect sits at the node's own top-left quadrant and must scale on the x axis to match
    const id = addImageRectangle({ height: 20, rotation: 0, width: 20, x: 10, y: 10 });

    // before
    resizeBoxNode(id, { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 }, store.dispatch, { x: 0, y: 0 }, 2, 1, true, null);

    // result
    const node = selectActivePage(store.getState()).nodes[id] as TRectangleNode;

    expect(node).toMatchObject({ width: 200 });
    expect(node.fills[0]).toMatchObject({ crop: { height: 20, width: 40, x: 20, y: 10 } });
  });

  it("should leave the image editor's crop and flip untouched when the frame is resized while that node's image editor is active in crop mode (regression: resizing the frame scaled/mirrored the crop along with it)", () => {
    // mock
    const id = addImageRectangle({ height: 20, rotation: 0, width: 20, x: 10, y: 10 });

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 }));

    // before — double the width and mirror on X, same as the two tests above combined
    resizeBoxNode(id, { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 }, store.dispatch, { x: 0, y: 0 }, -2, 1, true, null);

    // result — the frame resized, but the crop rect and flip stayed exactly as they were
    const node = selectActivePage(store.getState()).nodes[id] as TRectangleNode;

    expect(node).toMatchObject({ width: 200 });
    expect(node.fills[0]).toMatchObject({ crop: { height: 20, width: 20, x: 10, y: 10 } });
    expect((node.fills[0] as TImagePaint).flipX).toBeFalsy();
  });

  it('should mirror an image fill’s content when a Rectangle resize crosses the anchor, since a rectangle has no flip field of its own', () => {
    // mock — a rectangle has no flip field (isFlippableNode excludes it), so a mirror-crossing
    // resize must carry the mirror via the image PAINT's own flipX/flipY instead
    const id = addImageRectangleNoCrop();

    // before — dragging the east handle past the west anchor (x=0) is a "mirror" resize
    resizeBoxNode(
      id,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      -0.5,
      1,
      true,
      null,
    );

    // result
    const node = selectActivePage(store.getState()).nodes[id] as TRectangleNode;

    expect(node).toMatchObject({ width: 50, x: -50 });
    expect((node.fills[0] as TImagePaint).flipX).toBe(true);
  });

  it('should un-mirror the image fill when the drag is pulled back past the anchor again, on either axis (regression: the fill dispatch used to be skipped whenever it happened to equal the original, leaving a stale flip from an earlier tick in place forever)', () => {
    // mock — cross the anchor on X, then cross back within the same drag (same cached original)
    const idX = addImageRectangleNoCrop();

    resizeBoxNode(
      idX,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      -0.5,
      1,
      true,
      null,
    );

    const midX = selectActivePage(store.getState()).nodes[idX] as TRectangleNode;

    expect((midX.fills[0] as TImagePaint).flipX).toBe(true);

    resizeBoxNode(
      idX,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      0.5,
      1,
      true,
      null,
    );

    const afterX = selectActivePage(store.getState()).nodes[idX] as TRectangleNode;

    expect(afterX).toMatchObject({ width: 50, x: 0 });
    expect((afterX.fills[0] as TImagePaint).flipX).toBeUndefined();

    // mock — same thing on Y, via the north handle
    const idY = addImageRectangleNoCrop();

    resizeBoxNode(
      idY,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: null, y: 0 },
      1,
      -0.5,
      true,
      null,
    );

    const midY = selectActivePage(store.getState()).nodes[idY] as TRectangleNode;

    expect((midY.fills[0] as TImagePaint).flipY).toBe(true);

    resizeBoxNode(
      idY,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: null, y: 0 },
      1,
      0.5,
      true,
      null,
    );

    const afterY = selectActivePage(store.getState()).nodes[idY] as TRectangleNode;

    expect(afterY).toMatchObject({ height: 50, y: 0 });
    expect((afterY.fills[0] as TImagePaint).flipY).toBeUndefined();
  });

  it('should keep carrying a stored crop correctly across a mirror-and-back round trip too', () => {
    // mock — same round trip as above, but with an actual stored crop to prove the crop-scale and
    // the flip-mirror compose correctly together, not just in isolation
    const id = addImageRectangle({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    resizeBoxNode(
      id,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      -0.5,
      1,
      true,
      null,
    );
    resizeBoxNode(id, { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 }, store.dispatch, { x: 0, y: 0 }, 0.5, 1, true, null);

    // result — geometry, crop, and flip all fully restored
    const node = selectActivePage(store.getState()).nodes[id] as TRectangleNode;

    expect(node).toMatchObject({ width: 50, x: 0 });
    expect((node.fills[0] as TImagePaint).crop).toEqual({ height: 100, rotation: 0, width: 50, x: 0, y: 0 });
    expect((node.fills[0] as TImagePaint).flipX).toBeUndefined();
  });

  it('should mirror a pattern fill’s content the same way as an image, and restore it when the drag crosses back', () => {
    // mock — a pattern paint has no crop concept, only flipX/flipY, so this exercises the branch of
    // getResizedBoxFills that skips scaleFillsCrop entirely (no image fill present)
    const id = addPatternRectangle();

    // before — cross the anchor
    resizeBoxNode(
      id,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      -0.5,
      1,
      true,
      null,
    );

    const mid = selectActivePage(store.getState()).nodes[id] as TRectangleNode;

    expect(mid).toMatchObject({ width: 50, x: -50 });
    expect((mid.fills[0] as TPatternPaint).flipX).toBe(true);

    // before — cross back
    resizeBoxNode(id, { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 }, store.dispatch, { x: 0, y: 0 }, 0.5, 1, true, null);

    const after = selectActivePage(store.getState()).nodes[id] as TRectangleNode;

    expect(after).toMatchObject({ width: 50, x: 0 });
    expect((after.fills[0] as TPatternPaint).flipX).toBeUndefined();
  });

  it('should not touch fills when resizing a node with no image crop to carry along', () => {
    // mock
    const idA = addFrameNode();

    // before
    resizeBoxNode(idA, { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 }, store.dispatch, { x: 0, y: 0 }, 2, 1, true, null);

    // result — the frame's plain solid fill is dispatched unchanged, not rewritten
    const page = selectActivePage(store.getState());

    expect(page.nodes[idA]).toMatchObject({ fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] });
  });

  it('should do nothing when the resized node can no longer be found in the store', () => {
    // before — resizing an id that was never added should not throw
    expect(() =>
      resizeBoxNode(
        'missing-id',
        { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
        store.dispatch,
        { x: 0, y: 0 },
        2,
        1,
        true,
        null,
      ),
    ).not.toThrow();
  });
});
