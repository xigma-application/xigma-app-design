import { RefObject } from 'react';

// store
import { addNode, setActiveTool, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TFrameNode, TVectorNode } from 'types/design/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { continueResizeDrag } from '../continueResizeDrag';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { rotatePoint } from 'utils/math/rotatePoint';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, ...options });

const createResizeDragRef = (resizeDragState: TResizeDragState | null = null): RefObject<TResizeDragState | null> => ({
  current: resizeDragState,
});

const addFrameNode = (x: number, y: number, width: number, height: number, parentId: string | null = null, rotation = 0): string => {
  store.dispatch(addNode({ fill: '#ff0000', height, name: 'Frame', parentId, rotation, type: NodeType.frame, width, x, y }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number, parentId: string | null = null): string => {
  store.dispatch(addNode({ name: 'Line', parentId, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addMediaNode = (x: number, y: number, width: number, height: number, parentId: string | null = null, rotation = 0): string => {
  store.dispatch(
    addNode({ flipX: false, flipY: false, height, name: 'Image', parentId, rotation, src: 'a.png', type: NodeType.media, width, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addVectorNode = (x: number, y: number, width: number, height: number, rotation = 0): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x, y },
        v2: { id: 'v2', x: x + width, y },
        v3: { id: 'v3', x: x + width, y: y + height },
        v4: { id: 'v4', x, y: y + height },
      },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueResizeDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueResizeDrag(canvas, pointerEvent(10, 10), store.dispatch, createResizeDragRef(), createCanvasRefs());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should resize a single node from a corner handle', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 50);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 2,
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: { [idA]: { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 } },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(150, 80), store.dispatch, resizeDragRef, createCanvasRefs());

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 80, width: 150, x: 0, y: 0 });
  });

  it('should lock the aspect ratio on a corner handle while Shift is held', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 50);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 2,
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: { [idA]: { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 } },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(150, 80, { shiftKey: true }), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — height-driven since raw width (150) is proportionally narrower than the 2:1 ratio needs
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 80, width: 160, x: 0, y: 0 });
  });

  it('should ignore Shift on an edge handle, since aspect-lock only applies to corners', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 50);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 2,
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: { [idA]: { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 } },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(150, 999, { shiftKey: true }), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — vertical axis untouched, exactly as a plain (unlocked) east-edge resize
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 50, width: 150, x: 0, y: 0 });
  });

  it('should scale every selected node — including a line by its endpoints — proportionally to the shared bbox', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 100, 'parent-1');
    const idLine = addLineNode(20, 20, 80, 80, 'parent-1');
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: {
        [idA]: { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
        [idLine]: { x1: 20, x2: 80, y1: 20, y2: 80 },
      },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(200, 200), store.dispatch, resizeDragRef, createCanvasRefs());

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 200, width: 200, x: 0, y: 0 });
    expect(store.getState().design.nodes[idLine]).toMatchObject({ x1: 40, x2: 160, y1: 40, y2: 160 });
  });

  it('should guard the scale factor instead of dividing by a zero-size origin bounds', () => {
    // mock
    const idA = addFrameNode(5, 5, 0, 0);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 0, width: 0, x: 5, y: 5 },
      handle: 'se',
      nodeOrigins: { [idA]: { flip: null, height: 0, rotation: 0, width: 0, x: 5, y: 5 } },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(50, 50), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — without the guard, scale would be Infinity (2 / 0) and 0 * Infinity would produce NaN
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 0, width: 0, x: 5, y: 5 });
  });

  it('should mirror a single node when the drag crosses the opposite anchor, instead of sticking at MIN_SHAPE_SIZE', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 100);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: { [idA]: { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 } },
    });

    // before — dragging the east edge 30 units past the west anchor (x=0)
    continueResizeDrag(canvas, pointerEvent(-30, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — box now sits to the west of the anchor, growing from it, not stuck at a sliver
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 100, width: 30, x: -30, y: 0 });
  });

  it('should swap the relative order of group members when the whole group mirrors, not just scale them in place', () => {
    // mock — A on the left half (x 0-50), B on the right half (x 50-100) of a shared 0..100 bbox
    const idA = addFrameNode(0, 0, 50, 20, 'parent-1');
    const idB = addFrameNode(50, 0, 50, 20, 'parent-1');
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 5,
      bounds: { height: 20, width: 100, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: {
        [idA]: { flip: null, height: 20, rotation: 0, width: 50, x: 0, y: 0 },
        [idB]: { flip: null, height: 20, rotation: 0, width: 50, x: 50, y: 0 },
      },
    });

    // before — drag the east edge past the west anchor (x=0), flipping the whole group
    continueResizeDrag(canvas, pointerEvent(-100, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — A was on the left, now sits on the RIGHT of the mirrored group (and vice versa for B)
    expect(store.getState().design.nodes[idA]).toMatchObject({ width: 50, x: -50 });
    expect(store.getState().design.nodes[idB]).toMatchObject({ width: 50, x: -100 });
  });

  it('should mirror X and Y independently on a diagonal (corner) crossing', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 100);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: { [idA]: { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 } },
    });

    // before — X crosses the anchor (point.x < 0), Y does not (point.y > 0)
    continueResizeDrag(canvas, pointerEvent(-20, 50), store.dispatch, resizeDragRef, createCanvasRefs());

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 50, width: 20, x: -20, y: 0 });
  });

  it('should flip a media node when the drag crosses the anchor, leaving a plain rectangle untouched', () => {
    // mock
    const idMedia = addMediaNode(0, 0, 100, 100);
    const idRect = addFrameNode(200, 0, 100, 100);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: {
        [idMedia]: { flip: { x: false, y: false }, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
        [idRect]: { flip: null, height: 100, rotation: 0, width: 100, x: 200, y: 0 },
      },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(-30, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result
    expect(store.getState().design.nodes[idMedia]).toMatchObject({ flipX: true, flipY: false });
    expect(store.getState().design.nodes[idRect]).not.toHaveProperty('flipX');
  });

  it('should restore the original flip state when the drag is pulled back past the anchor again', () => {
    // mock — media node already flipped before this drag started
    const idMedia = addMediaNode(0, 0, 100, 100);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: { [idMedia]: { flip: { x: true, y: false }, height: 100, rotation: 0, width: 100, x: 0, y: 0 } },
    });

    // before — cross the anchor once (flips relative to origin), then move back to the normal side
    continueResizeDrag(canvas, pointerEvent(-30, 500), store.dispatch, resizeDragRef, createCanvasRefs());
    expect(store.getState().design.nodes[idMedia]).toMatchObject({ flipX: false });

    continueResizeDrag(canvas, pointerEvent(30, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — back on the original side, flip state matches what it was before this drag began
    expect(store.getState().design.nodes[idMedia]).toMatchObject({ flipX: true });
  });

  it("should flip a rotated GROUP MEMBER across its own local axis, not the group's world axis, when the drag crosses", () => {
    // mock — idA is rotated 90deg, so its local x-axis (flipX) lies along the world Y-axis and its
    const idA = addMediaNode(0, 0, 100, 50, null, 90);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 50, width: 220, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: {
        [idA]: { flip: { x: false, y: false }, height: 50, rotation: 90, width: 100, x: 0, y: 0 },
        'sibling-1': { flip: null, height: 20, rotation: 0, width: 20, x: 200, y: 0 },
      },
    });

    // before — world-X anchor crossed (scaleX < 0), world-Y untouched (scaleY = 1)
    continueResizeDrag(canvas, pointerEvent(-50, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — a world-X crossing projects onto this 90deg member's local Y axis, so flipY (not
    expect(store.getState().design.nodes[idA]).toMatchObject({ flipX: false, flipY: true });
  });

  it("should leave an UNROTATED group member's flip axes unchanged from the pre-projection behavior", () => {
    // mock — same shape as the rotated-member test above but rotation=0, so local axes equal world
    const idA = addMediaNode(0, 0, 100, 50);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 50, width: 220, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: {
        [idA]: { flip: { x: false, y: false }, height: 50, rotation: 0, width: 100, x: 0, y: 0 },
        'sibling-1': { flip: null, height: 20, rotation: 0, width: 20, x: 200, y: 0 },
      },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(-50, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ flipX: true, flipY: false });
  });

  it("should grow a rotated GROUP MEMBER along its own local axes, not the group's world axes, on an anisotropic resize", () => {
    // mock — a 90deg-rotated node's local x-axis lies along the world y-axis and vice versa, so a
    const idA = addFrameNode(0, 0, 100, 50, 'parent-1', 90);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: {
        [idA]: { flip: null, height: 50, rotation: 90, width: 100, x: 0, y: 0 },
        'sibling-1': { flip: null, height: 50, rotation: 0, width: 50, x: 50, y: 50 },
      },
    });

    // before — east edge dragged from x=100 to x=200 (world), anchored at x=0: scaleX=2, scaleY=1
    continueResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — local width unchanged (scaleY=1 projects onto it at 90deg), local height doubled
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 100, rotation: 90, width: 100, x: 50, y: -25 });
  });

  it('should scale a non-axis-aligned GROUP MEMBER on its dominant local axis only, like an unrotated node', () => {
    // mock — same horizontal-only group resize (scaleX 2, scaleY 1); at 30deg the local x-axis is
    const idA = addFrameNode(0, 0, 100, 50, 'parent-1', 30);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: {
        [idA]: { flip: null, height: 50, rotation: 30, width: 100, x: 0, y: 0 },
        'sibling-1': { flip: null, height: 50, rotation: 0, width: 50, x: 50, y: 50 },
      },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — width doubles with scaleX (and would reach exactly 0 alongside it), height and
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 50, rotation: 30, width: 200, x: 0, y: 0 });
  });

  it('should resize a single, lone-selected rotated node by rotating the pointer back into its own local frame', () => {
    // mock — a single 90deg-rotated node's own bounds ARE its local, unrotated frame (unlike a
    const idA = addFrameNode(0, 0, 100, 50, null, 90);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: { [idA]: { flip: null, height: 50, rotation: 90, width: 100, x: 0, y: 0 } },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — local height untouched, local width grown ×5.25 (the raw world-space drag distance,
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 50, rotation: 90, width: 525, x: -212.5, y: 212.5 });
  });

  it('should keep the anchor edge fixed in WORLD space when resizing a single rotated node, not just at the same local coordinate', () => {
    // mock — the "e" handle anchors the west edge; a 90deg rotation means that edge's world position
    const idA = addFrameNode(0, 0, 100, 50, null, 90);
    const canvas = createCanvas();
    const bounds = { height: 50, width: 100, x: 0, y: 0 };
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds,
      handle: 'e',
      nodeOrigins: { [idA]: { flip: null, height: 50, rotation: 90, width: 100, x: 0, y: 0 } },
    });
    const oldCenter = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const anchorWorldBefore = rotatePoint({ x: bounds.x, y: oldCenter.y }, oldCenter, 90);

    // before
    continueResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result
    const node = store.getState().design.nodes[idA] as TFrameNode;
    const newCenter = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const anchorWorldAfter = rotatePoint({ x: node.x, y: newCenter.y }, newCenter, 90);

    expect(anchorWorldAfter.x).toBeCloseTo(anchorWorldBefore.x);
    expect(anchorWorldAfter.y).toBeCloseTo(anchorWorldBefore.y);
  });

  it('should keep the anchor CORNER fixed in world space for a "min"-side handle (e.g. "nw") too, at a non-right-angle rotation', () => {
    // mock — the "e" tests above only ever anchor a "max"-side axis; "nw" anchors its opposite (se)
    const idA = addFrameNode(0, 0, 100, 50, null, 45);
    const canvas = createCanvas();
    const bounds = { height: 50, width: 100, x: 0, y: 0 };
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 2,
      bounds,
      handle: 'nw',
      nodeOrigins: { [idA]: { flip: null, height: 50, rotation: 45, width: 100, x: 0, y: 0 } },
    });
    const oldCenter = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const anchorWorldBefore = rotatePoint({ x: bounds.x + bounds.width, y: bounds.y + bounds.height }, oldCenter, 45);

    // before — drag the nw handle further up and to the left (a screen point whose un-rotated local
    continueResizeDrag(canvas, pointerEvent(-38.388, -169.454), store.dispatch, resizeDragRef, createCanvasRefs());

    // result
    const node = store.getState().design.nodes[idA] as TFrameNode;
    const newCenter = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const anchorWorldAfter = rotatePoint({ x: node.x + node.width, y: node.y + node.height }, newCenter, 45);

    expect(anchorWorldAfter.x).toBeCloseTo(anchorWorldBefore.x);
    expect(anchorWorldAfter.y).toBeCloseTo(anchorWorldBefore.y);
  });

  it('should not jump the anchor corner between consecutive frames of a rotated resize drag, even as x/y cross whole-pixel rounding thresholds', () => {
    // mock — a 30deg-rotated node, dragged through a dense sweep of "e" handle positions; before the
    const idA = addFrameNode(0, 0, 137, 61, null, 30);
    const canvas = createCanvas();
    const bounds = { height: 61, width: 137, x: 0, y: 0 };
    let previousAnchor: { x: number; y: number } | null = null;
    let maxFrameJump = 0;

    for (let endX = 140; endX <= 260; endX += 0.15) {
      const resizeDragRef = createResizeDragRef({
        aspectRatio: bounds.width / bounds.height,
        bounds,
        handle: 'e',
        nodeOrigins: { [idA]: { flip: null, height: 61, rotation: 30, width: 137, x: 0, y: 0 } },
      });

      // before
      continueResizeDrag(canvas, pointerEvent(endX, 500), store.dispatch, resizeDragRef, createCanvasRefs());

      // result
      const node = store.getState().design.nodes[idA] as TFrameNode;
      const newCenter = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
      const anchor = rotatePoint({ x: node.x, y: newCenter.y }, newCenter, 30);

      if (previousAnchor) {
        maxFrameJump = Math.max(maxFrameJump, Math.hypot(anchor.x - previousAnchor.x, anchor.y - previousAnchor.y));
      }

      previousAnchor = anchor;
    }

    expect(maxFrameJump).toBeLessThan(0.01);
  });

  it('should mirror a single rotated node when the drag crosses the anchor, instead of collapsing back to the original box', () => {
    // mock — a 90deg-rotated square; the anchor corner ("nw", opposite the "se" handle) sits at
    const idA = addFrameNode(300, 300, 100, 100, null, 90);
    const canvas = createCanvas();
    const bounds = { height: 100, width: 100, x: 300, y: 300 };
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds,
      handle: 'se',
      nodeOrigins: { [idA]: { flip: null, height: 100, rotation: 90, width: 100, x: 300, y: 300 } },
    });
    const oldCenter = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const anchorWorldBefore = rotatePoint({ x: bounds.x, y: bounds.y }, oldCenter, 90);

    // before — symmetric full crossing (world point mirrors the "se" corner through the anchor)
    continueResizeDrag(canvas, pointerEvent(500, 200), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — same size (a true mirror, not a shrink/grow) and NOT back at the original position
    const node = store.getState().design.nodes[idA] as TFrameNode;

    expect(node).toMatchObject({ height: 100, rotation: 90, width: 100 });
    expect(node.x !== 300 || node.y !== 300).toBe(true);

    const newCenter = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const anchorWorldAfter = rotatePoint({ x: node.x + node.width, y: node.y + node.height }, newCenter, 90);

    expect(anchorWorldAfter.x).toBeCloseTo(anchorWorldBefore.x);
    expect(anchorWorldAfter.y).toBeCloseTo(anchorWorldBefore.y);
  });

  it('should keep the anchor edge fixed in WORLD space when resizing a single rotated VECTOR node, mirroring a rotated box', () => {
    // mock — same 100x50, 90deg, "e"-handle scenario as the box test above, adapted to a vector node's
    // vertex-cloud geometry, to prove a rotated vector's opposite edge no longer drifts on resize
    const idA = addVectorNode(0, 0, 100, 50, 90);
    const canvas = createCanvas();
    const bounds = { height: 50, width: 100, x: 0, y: 0 };
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds,
      handle: 'e',
      nodeOrigins: {
        [idA]: {
          rotation: 90,
          segments: {},
          vertices: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 }, v3: { x: 100, y: 50 }, v4: { x: 0, y: 50 } },
        },
      },
    });
    const oldCenter = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const anchorWorldBefore = rotatePoint({ x: bounds.x, y: oldCenter.y }, oldCenter, 90);

    // before
    continueResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, resizeDragRef, createCanvasRefs());

    // result
    const node = store.getState().design.nodes[idA] as TVectorNode;
    const newBounds = getVectorNodeBounds(node);
    const newCenter = { x: newBounds.x + newBounds.width / 2, y: newBounds.y + newBounds.height / 2 };
    const anchorWorldAfter = rotatePoint({ x: newBounds.x, y: newCenter.y }, newCenter, 90);

    expect(anchorWorldAfter.x).toBeCloseTo(anchorWorldBefore.x);
    expect(anchorWorldAfter.y).toBeCloseTo(anchorWorldBefore.y);
  });

  it('should leave a single unrotated node exactly as before (no behavior change from the local-frame fix)', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 50);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 2,
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: { [idA]: { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 } },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(150, 80), store.dispatch, resizeDragRef, createCanvasRefs());

    // result — identical to the very first "resize a single node from a corner handle" test above
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 80, width: 150, x: 0, y: 0 });
  });

  describe('Scale tool', () => {
    afterEach(() => {
      store.dispatch(setActiveTool(ToolName.default));
    });

    it('should pivot at the bottom-center point when grabbing the top edge, growing both dimensions proportionally', () => {
      // mock — a 100x50 frame; the Scale tool forces proportional scaling with no Shift key needed
      const idA = addFrameNode(0, 0, 100, 50);
      const canvas = createCanvas();
      const resizeDragRef = createResizeDragRef({
        aspectRatio: 2,
        bounds: { height: 50, width: 100, x: 0, y: 0 },
        handle: 'n',
        nodeOrigins: { [idA]: { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 } },
      });

      // before
      store.dispatch(setActiveTool(ToolName.scale));
      continueResizeDrag(canvas, pointerEvent(50, -50), store.dispatch, resizeDragRef, createCanvasRefs());

      // result — height doubles (50→100) and width doubles too (100→200, unlike a plain resize,
      expect(store.getState().design.nodes[idA]).toMatchObject({ height: 100, width: 200, x: -50, y: -50 });
    });

    it('should pivot at the opposite (bottom-right) corner when grabbing the top-left corner, same anchor as a plain resize', () => {
      // mock — a 100x100 frame; the Scale tool reuses the exact same corner-anchor geometry as a
      const idA = addFrameNode(0, 0, 100, 100);
      const canvas = createCanvas();
      const resizeDragRef = createResizeDragRef({
        aspectRatio: 1,
        bounds: { height: 100, width: 100, x: 0, y: 0 },
        handle: 'nw',
        nodeOrigins: { [idA]: { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 } },
      });

      // before
      store.dispatch(setActiveTool(ToolName.scale));
      continueResizeDrag(canvas, pointerEvent(-50, -50), store.dispatch, resizeDragRef, createCanvasRefs());

      // result — the bottom-right corner (100, 100) stays fixed while the box grows northwest
      expect(store.getState().design.nodes[idA]).toMatchObject({ height: 150, width: 150, x: -50, y: -50 });
    });

    it('should NOT force proportional scaling when the Scale tool is inactive, even on the same edge drag', () => {
      // mock — same 100x50 frame and "n" handle drag as the first Scale test above, but with the
      const idA = addFrameNode(0, 0, 100, 50);
      const canvas = createCanvas();
      const resizeDragRef = createResizeDragRef({
        aspectRatio: 2,
        bounds: { height: 50, width: 100, x: 0, y: 0 },
        handle: 'n',
        nodeOrigins: { [idA]: { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 } },
      });

      // before
      continueResizeDrag(canvas, pointerEvent(50, -50), store.dispatch, resizeDragRef, createCanvasRefs());

      // result
      expect(store.getState().design.nodes[idA]).toMatchObject({ height: 100, width: 100, x: 0, y: -50 });
    });
  });

  describe('vector node resize snapshots', () => {
    const buildSnapshot = () => ({
      anchorX: null,
      anchorY: null,
      facesByColor: [],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#000000',
      strokeWidth: 1,
    });

    it('should update a snapshotted vector node’s anchor/scale and mark it as resized, without touching the store at all', () => {
      // mock
      const idA = addVectorNode(0, 0, 100, 50);
      const canvas = createCanvas();
      const resizeDragRef = createResizeDragRef({
        aspectRatio: 2,
        bounds: { height: 50, width: 100, x: 0, y: 0 },
        handle: 'se',
        nodeOrigins: {
          [idA]: {
            rotation: 0,
            segments: {},
            vertices: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 }, v3: { x: 100, y: 50 }, v4: { x: 0, y: 50 } },
          },
        },
      });
      const canvasRefs = createCanvasRefs();
      const snapshot = buildSnapshot();

      canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current = new Map([[idA, snapshot]]);

      const nodeBefore = store.getState().design.nodes[idA];

      // before
      continueResizeDrag(canvas, pointerEvent(150, 80), store.dispatch, resizeDragRef, canvasRefs);

      // result — the store node is untouched, but the snapshot itself now reflects the live drag
      expect(store.getState().design.nodes[idA]).toBe(nodeBefore);
      expect(snapshot.scaleX).toBeCloseTo(1.5);
      expect(snapshot.scaleY).toBeCloseTo(1.6);
      expect(canvasRefs.transform.resizedNodeIdsRef.current).toEqual(new Set([idA]));
    });

    it('should not replace an already-initialized resized-node-ids set on a subsequent pointermove', () => {
      // mock
      const idA = addVectorNode(0, 0, 100, 50);
      const canvas = createCanvas();
      const resizeDragRef = createResizeDragRef({
        aspectRatio: 2,
        bounds: { height: 50, width: 100, x: 0, y: 0 },
        handle: 'se',
        nodeOrigins: {
          [idA]: {
            rotation: 0,
            segments: {},
            vertices: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 }, v3: { x: 100, y: 50 }, v4: { x: 0, y: 50 } },
          },
        },
      });
      const canvasRefs = createCanvasRefs();

      canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current = new Map([[idA, buildSnapshot()]]);

      const existingSet = new Set(['some-other-id']);

      canvasRefs.transform.resizedNodeIdsRef.current = existingSet;

      // before
      continueResizeDrag(canvas, pointerEvent(150, 80), store.dispatch, resizeDragRef, canvasRefs);

      // result
      expect(canvasRefs.transform.resizedNodeIdsRef.current).toBe(existingSet);
    });

    it('should update a snapshotted SINGLE ROTATED vector node’s pivot/scaledCenter (not just anchor/scale) via the rotated-anchor solver, without touching the store', () => {
      // mock — same 100x50, 90deg, "e"-handle scenario as the dispatch-path rotated-vector test above
      const idA = addVectorNode(0, 0, 100, 50, 90);
      const canvas = createCanvas();
      const resizeDragRef = createResizeDragRef({
        aspectRatio: 1,
        bounds: { height: 50, width: 100, x: 0, y: 0 },
        handle: 'e',
        nodeOrigins: {
          [idA]: {
            rotation: 90,
            segments: {},
            vertices: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 }, v3: { x: 100, y: 50 }, v4: { x: 0, y: 50 } },
          },
        },
      });
      const canvasRefs = createCanvasRefs();
      const snapshot = buildSnapshot();

      snapshot.rotation = 90;
      canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current = new Map([[idA, snapshot]]);

      const nodeBefore = store.getState().design.nodes[idA];

      // before
      continueResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, resizeDragRef, canvasRefs);

      // result — the store node is untouched, but the rotated-anchor solver ran and moved the
      // snapshot's pivot/scaledCenter away from their identity-scale capture-time defaults
      expect(store.getState().design.nodes[idA]).toBe(nodeBefore);
      expect(snapshot.pivot).not.toEqual({ x: 0, y: 0 });
      expect(snapshot.scaledCenter).not.toEqual({ x: 0, y: 0 });
    });

    it('should still dispatch normally for a non-snapshotted node in the same resize gesture as a snapshotted one', () => {
      // mock — a mixed selection: one vector node fast-pathed via a snapshot, one plain frame resized live
      const idVector = addVectorNode(0, 0, 100, 50);
      const idFrame = addFrameNode(0, 0, 100, 50);
      const canvas = createCanvas();
      const resizeDragRef = createResizeDragRef({
        aspectRatio: 2,
        bounds: { height: 50, width: 100, x: 0, y: 0 },
        handle: 'se',
        nodeOrigins: {
          [idFrame]: { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 },
          [idVector]: {
            rotation: 0,
            segments: {},
            vertices: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 }, v3: { x: 100, y: 50 }, v4: { x: 0, y: 50 } },
          },
        },
      });
      const canvasRefs = createCanvasRefs();

      canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current = new Map([[idVector, buildSnapshot()]]);

      // before
      continueResizeDrag(canvas, pointerEvent(150, 80), store.dispatch, resizeDragRef, canvasRefs);

      // result — the frame still resized live through the store, the vector node's store entry is untouched
      expect(store.getState().design.nodes[idFrame]).toMatchObject({ height: 80, width: 150, x: 0, y: 0 });
    });
  });
});
