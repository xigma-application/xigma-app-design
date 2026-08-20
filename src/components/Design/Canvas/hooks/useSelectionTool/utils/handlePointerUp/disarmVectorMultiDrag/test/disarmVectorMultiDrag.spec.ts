import { RefObject } from 'react';

// store
import { addNode, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { disarmVectorMultiDrag } from '../disarmVectorMultiDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createVectorMultiDragRef = (vectorMultiDragState: TVectorMultiDragState | null = null): RefObject<TVectorMultiDragState | null> => ({
  current: vectorMultiDragState,
});

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('disarmVectorMultiDrag', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should do nothing when no multi-drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, createVectorMultiDragRef(), setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the vector-multi-drag ref, release pointer capture, and reset the cursor', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: {},
      hasMoved: true,
      nodeId: 'path-1',
      pendingClickAction: null,
      pointerStart: { x: 5, y: 5 },
      vertexOrigins: { 'vertex-1': { x: 0, y: 0 } },
    });
    const setClassName = vi.fn();

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, vectorMultiDragRef, setClassName);

    // result
    expect(vectorMultiDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should leave the current selection untouched when released without moving and there is no pending click action', () => {
    // mock — e.g. a plain (not-yet-selected) segment drag, which arms with no pendingClickAction at all
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorSegmentIdsRef.current = ['s1'];

    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: {},
      hasMoved: false,
      nodeId: 'path-1',
      pendingClickAction: null,
      pointerStart: { x: 5, y: 5 },
      vertexOrigins: { v1: { x: 0, y: 0 } },
    });

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, vectorMultiDragRef, vi.fn());

    // result
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
  });

  it('should collapse the selection down to the pending vertex when released without ever moving', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: {},
      hasMoved: false,
      nodeId: 'path-1',
      pendingClickAction: { id: 'v2', kind: 'vertex' },
      pointerStart: { x: 5, y: 5 },
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 0 } },
    });

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, vectorMultiDragRef, vi.fn());

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v2']);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should collapse the selection down to the pending handle when released without ever moving', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];
    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: {},
      hasMoved: false,
      nodeId: 'path-1',
      pendingClickAction: { end: 'start', kind: 'handle', segmentId: 's1' },
      pointerStart: { x: 5, y: 5 },
      vertexOrigins: {},
    });

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, vectorMultiDragRef, vi.fn());

    // result
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should collapse the selection down to the pending segment when released without ever moving', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorSegmentIdsRef.current = ['s1', 's2'];

    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: {},
      hasMoved: false,
      nodeId: 'path-1',
      pendingClickAction: { id: 's1', kind: 'segment' },
      pointerStart: { x: 5, y: 5 },
      vertexOrigins: {},
    });

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, vectorMultiDragRef, vi.fn());

    // result
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should leave the whole multi-selection untouched when the pointer actually moved, even with a pending click action', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: {},
      hasMoved: true,
      nodeId: 'path-1',
      pendingClickAction: { id: 'v2', kind: 'vertex' },
      pointerStart: { x: 5, y: 5 },
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 0 } },
    });

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, vectorMultiDragRef, vi.fn());

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1', 'v2']);
  });

  it('should split the pending segment and select the new vertex when released without ever moving — a plain click always splits, never leaves the segment selected', () => {
    // mock — v1(0,0)-v2(100,0), s1 selected (eagerly, at pointer-down) before this release resolves it
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorSegmentIdsRef.current = ['s1'];

    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: {},
      hasMoved: false,
      nodeId,
      pendingClickAction: { kind: 'split-segment', segmentId: 's1', t: 0.5 },
      pointerStart: { x: 50, y: 0 },
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 } },
    });

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, vectorMultiDragRef, vi.fn());

    // result — s1 is gone from the selection (the click always splits, per the direct ask, regardless of
    // whether it was already selected); a new vertex sits at the split point and is itself now selected
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const [newVertexId] = canvasRefs.selectedVectorVertexIdsRef.current;

    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toHaveLength(1);
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
    expect(Object.keys(updatedNode.segments)).toHaveLength(2);
  });

  it('should do nothing for a pending split-segment action if the vector-editing node can no longer be found', () => {
    // mock — e.g. the node got deleted or vector edit mode was exited between arm and release
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorSegmentIdsRef.current = ['s1'];

    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: {},
      hasMoved: false,
      nodeId: 'missing-node',
      pendingClickAction: { kind: 'split-segment', segmentId: 's1', t: 0.5 },
      pointerStart: { x: 50, y: 0 },
      vertexOrigins: {},
    });

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, vectorMultiDragRef, vi.fn());

    // result — untouched, no crash
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
  });
});
