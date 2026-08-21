import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { continueVectorMultiSelectResizeDrag } from '../continueVectorMultiSelectResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createVectorMultiSelectResizeDragRef = (
  dragState: TVectorMultiSelectResizeDragState | null = null,
): RefObject<TVectorMultiSelectResizeDragState | null> => ({ current: dragState });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorMultiSelectResizeDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueVectorMultiSelectResizeDrag(canvas, pointerEvent(10, 10), store.dispatch, createVectorMultiSelectResizeDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should do nothing when the drag points at a node that no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectResizeDragRef({
      anchor: { x: 0, y: 0 },
      anchorWorld: { x: 0, y: 0 },
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'se',
      handleOrigins: {},
      liveBounds: { height: 100, width: 100, x: 0, y: 0 },
      nodeId: 'missing-node',
      rotation: 0,
      vertexOrigins: { v1: { x: 0, y: 0 } },
    });

    // before
    continueVectorMultiSelectResizeDrag(canvas, pointerEvent(200, 200), store.dispatch, dragRef);

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should scale every selected vertex and every selected tangent offset relative to the fixed anchor corner', () => {
    // mock — v1(0,0)/v2(100,100) selected, dragging the "se" handle: anchor is the opposite ("nw") corner
    // (0,0), which coincides with v1 here, so v1 stays put while v2 and the tangent offset both double
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectResizeDragRef({
      anchor: { x: 0, y: 0 },
      anchorWorld: { x: 0, y: 0 },
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'se',
      handleOrigins: { 'start:s1': { x: 5, y: 0 } },
      liveBounds: { height: 100, width: 100, x: 0, y: 0 },
      nodeId,
      rotation: 0,
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 100 } },
    });

    // before — pointer dragged out to (200, 200): scale x2 on both axes
    continueVectorMultiSelectResizeDrag(canvas, pointerEvent(200, 200), store.dispatch, dragRef);

    // result
    const node = store.getState().design.nodes[nodeId];

    expect(node).toMatchObject({
      segments: { s1: { tangentStart: { x: 10, y: 0 } } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 200, y: 200 } },
    });
    // result — the box's own live shape tracks the scale too, for the render loop to draw during the drag
    expect(dragRef.current?.liveBounds).toEqual({ height: 200, width: 200, x: 0, y: 0 });
  });

  it('should scale along the box’s own (rotated) axes, not world axes, when the box is already tilted', () => {
    // mock — box rotated 90deg around its center (50,50): local "nw" anchor (0,0) sits at world
    // (100,0), local "se" corner (100,100) sits at world (0,100); v1 is the anchor, v2 is the dragged
    // corner (see the arithmetic in the file's own comment history for how these are derived)
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectResizeDragRef({
      anchor: { x: 0, y: 0 },
      anchorWorld: { x: 100, y: 0 },
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'se',
      handleOrigins: {},
      liveBounds: { height: 100, width: 100, x: 0, y: 0 },
      nodeId,
      rotation: 90,
      vertexOrigins: { v1: { x: 100, y: 0 }, v2: { x: 0, y: 100 } },
    });

    // before — pointer dragged to world (-100, 200), the rotated equivalent of doubling the local
    // scale from the anchor
    continueVectorMultiSelectResizeDrag(canvas, pointerEvent(-100, 200), store.dispatch, dragRef);

    // result — v1 (the anchor) stays put; v2 (the dragged corner) lands exactly on the pointer
    // (toBeCloseTo, not toEqual/toMatchObject: cos(90deg) via Math.cos isn't exactly 0, so the
    // anchor's own untouched axis can come out as a floating-point -0 instead of 0)
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.vertices.v1.x).toBeCloseTo(100);
    expect(node.vertices.v1.y).toBeCloseTo(0);
    expect(node.vertices.v2.x).toBeCloseTo(-100);
    expect(node.vertices.v2.y).toBeCloseTo(200);
  });

  it('should leave the perpendicular axis untouched for an edge handle', () => {
    // mock — "e" handle only scales x; y has no anchor at all, so v2's y stays exactly as it was
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectResizeDragRef({
      anchor: { x: 0, y: null },
      anchorWorld: { x: 0, y: 50 },
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'e',
      handleOrigins: {},
      liveBounds: { height: 100, width: 100, x: 0, y: 0 },
      nodeId,
      rotation: 0,
      vertexOrigins: { v2: { x: 100, y: 100 } },
    });

    // before
    continueVectorMultiSelectResizeDrag(canvas, pointerEvent(200, 500), store.dispatch, dragRef);

    // result
    const node = store.getState().design.nodes[nodeId];

    expect(node).toMatchObject({ vertices: { v2: { id: 'v2', x: 200, y: 100 } } });
  });

  it('should leave a vertex’s anchor-less axis untouched and scale a selected "end" tangent offset, for an "n" handle', () => {
    // mock — "n" handle only anchors y (from the far/"s" edge, 100); x has no anchor at all, so v1's x
    // must pass through unchanged while both its y and the end-side handle offset scale by 2x
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectResizeDragRef({
      anchor: { x: null, y: 100 },
      anchorWorld: { x: 50, y: 100 },
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'n',
      handleOrigins: { 'end:s1': { x: -3, y: 4 } },
      liveBounds: { height: 100, width: 100, x: 0, y: 0 },
      nodeId,
      rotation: 0,
      vertexOrigins: { v1: { x: 20, y: 10 } },
    });

    // before — pointer dragged to (anything, -100): scale y 2x from the anchor at y=100
    continueVectorMultiSelectResizeDrag(canvas, pointerEvent(999, -100), store.dispatch, dragRef);

    // result
    const node = store.getState().design.nodes[nodeId];

    expect(node).toMatchObject({
      segments: { s1: { tangentEnd: { x: -3, y: 8 } } },
      vertices: { v1: { id: 'v1', x: 20, y: -80 } },
    });
  });
});
