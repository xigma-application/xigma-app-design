import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TResizeDragState } from '../../../../types';

// utils
import { continueResizeDrag } from '../continueResizeDrag';
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

describe('continueResizeDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueResizeDrag(canvas, pointerEvent(10, 10), store.dispatch, createResizeDragRef());

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
    continueResizeDrag(canvas, pointerEvent(150, 80), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(150, 80, { shiftKey: true }), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(150, 999, { shiftKey: true }), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(200, 200), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(50, 50), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(-30, 500), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(-100, 500), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(-20, 50), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(-30, 500), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(-30, 500), store.dispatch, resizeDragRef);
    expect(store.getState().design.nodes[idMedia]).toMatchObject({ flipX: false });

    continueResizeDrag(canvas, pointerEvent(30, 500), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(-50, 500), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(-50, 500), store.dispatch, resizeDragRef);

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
    continueResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, resizeDragRef);

    // result — local width unchanged (scaleY=1 projects onto it at 90deg), local height doubled
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 100, rotation: 90, width: 100, x: 50, y: -25 });
  });

  it('should smoothly blend both axis scales for a non-axis-aligned rotation, keeping a true (unsheared) rectangle', () => {
    // mock — same horizontal-only group resize (scaleX 2, scaleY 1), but at 30deg neither local axis
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
    continueResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, resizeDragRef);

    // result — width = 100·√((2·cos30)²+sin30²) ≈ 180.28, height = 50·√((2·sin30)²+cos30²) ≈ 66.14,
    // rounded to whole pixels on dispatch
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 66, rotation: 30, width: 180, x: 10, y: -8 });
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
    continueResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, resizeDragRef);

    // result — local height untouched, local width grown ×5.25 (the raw world-space drag distance,
    // rounded to whole pixels on dispatch)
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 50, rotation: 90, width: 525, x: -212, y: 213 });
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
    continueResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, resizeDragRef);

    // result
    const node = store.getState().design.nodes[idA] as TFrameNode;
    const newCenter = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const anchorWorldAfter = rotatePoint({ x: node.x, y: newCenter.y }, newCenter, 90);

    // rounding x/y/width/height to whole pixels means the anchor is only APPROXIMATELY fixed now,
    // within the rounding error, not pixel-perfectly exact
    expect(Math.abs(anchorWorldAfter.x - anchorWorldBefore.x)).toBeLessThan(1);
    expect(Math.abs(anchorWorldAfter.y - anchorWorldBefore.y)).toBeLessThan(1);
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
    continueResizeDrag(canvas, pointerEvent(-38.388, -169.454), store.dispatch, resizeDragRef);

    // result
    const node = store.getState().design.nodes[idA] as TFrameNode;
    const newCenter = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const anchorWorldAfter = rotatePoint({ x: node.x + node.width, y: node.y + node.height }, newCenter, 45);

    expect(Math.abs(anchorWorldAfter.x - anchorWorldBefore.x)).toBeLessThan(1);
    expect(Math.abs(anchorWorldAfter.y - anchorWorldBefore.y)).toBeLessThan(1);
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
    continueResizeDrag(canvas, pointerEvent(500, 200), store.dispatch, resizeDragRef);

    // result — same size (a true mirror, not a shrink/grow) and NOT back at the original position
    const node = store.getState().design.nodes[idA] as TFrameNode;

    expect(node).toMatchObject({ height: 100, rotation: 90, width: 100 });
    expect(node.x !== 300 || node.y !== 300).toBe(true);

    const newCenter = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const anchorWorldAfter = rotatePoint({ x: node.x + node.width, y: node.y + node.height }, newCenter, 90);

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
    continueResizeDrag(canvas, pointerEvent(150, 80), store.dispatch, resizeDragRef);

    // result — identical to the very first "resize a single node from a corner handle" test above
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 80, width: 150, x: 0, y: 0 });
  });
});
