// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { createSelectionToolRefs } from '../../../hooks/useSelectionToolRefs/createSelectionToolRefs';
import { disarmVectorVertexDrag } from '../disarmVectorVertexDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const addVectorNode = (vertices: { id: string; x: number; y: number }[], segments: Record<string, TVectorSegment> = {}): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: Object.fromEntries(vertices.map((vertex) => [vertex.id, vertex])),
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('disarmVectorVertexDrag', () => {
  it('should do nothing when no vector vertex drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();
    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the vector-vertex-drag ref and the alignment guide, release pointer capture, and reset the cursor', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      nodeId: 'path-1',
      origins: { 'vertex-1': { x: 0, y: 0 } },
      pointerStart: { x: 5, y: 5 },
    };
    canvasRefs.vectorEdit.vectorAlignmentGuideRef.current = {
      horizontal: null,
      vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 0 } },
    };

    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(selectionRefs.vectorVertexDragRef.current).toBeNull();
    expect(canvasRefs.vectorEdit.vectorAlignmentGuideRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should do nothing merge-related when the drag points at a node that no longer exists, even with a merge target recorded', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      mergeTarget: { nodeId: 'missing-target', vertexId: 'v2' },
      nodeId: 'missing-node',
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };

    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(selectionRefs.vectorVertexDragRef.current).toBeNull();
  });

  it('should abandon a cross-node merge without crashing when the target node was deleted before pointerup', () => {
    // mock — source node is still valid, but the merge target node vanished from the store in the meantime
    // (e.g. deleted by another selection or a concurrent edit) before the drag was released
    const idA = addVectorNode([{ id: 'v1', x: 200, y: 200 }]);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      mergeTarget: { nodeId: 'deleted-node', vertexId: 'v2' },
      nodeId: idA,
      origins: { v1: { x: 200, y: 200 } },
      pointerStart: { x: 200, y: 200 },
    };

    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({
      vertices: { v1: { id: 'v1', x: 200, y: 200 } },
    });
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(selectionRefs.vectorVertexDragRef.current).toBeNull();
  });

  it('should clear stale selected handles and segments after a same-node merge collapses their shared segment', () => {
    // mock — v1/v2 share segment "s1", which will collapse into a self-loop and get pruned by the merge;
    // s1 is pre-selected as a handle and a segment, simulating stale refs left over from before the drag
    const idA = addVectorNode(
      [
        { id: 'v1', x: 100, y: 0 },
        { id: 'v2', x: 100, y: 0 },
      ],
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'end', segmentId: 's1' }];
    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = ['s1'];
    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      mergeTarget: { nodeId: idA, vertexId: 'v2' },
      nodeId: idA,
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };

    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TVectorNode;

    expect(node.segments).not.toHaveProperty('s1');
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should merge onto a target vertex of the SAME node, dropping the absorbed vertex, and select the surviving vertex', () => {
    // mock — v1 and v2 already exist on one node; v1 was dragged and snapped onto v2
    const idA = addVectorNode([
      { id: 'v1', x: 100, y: 0 },
      { id: 'v2', x: 100, y: 0 },
    ]);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      mergeTarget: { nodeId: idA, vertexId: 'v2' },
      nodeId: idA,
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };

    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TVectorNode;

    expect(node).toMatchObject({ vertices: { v1: { id: 'v1', x: 100, y: 0 } } });
    expect(Object.keys(node.vertices)).not.toContain('v2');
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toBeDefined();
  });

  it('should merge onto a target vertex of a DIFFERENT node, absorbing it and deleting that node', () => {
    // mock — two separate vector nodes; v1 (node A) was dragged onto v2 (node B)
    const idA = addVectorNode([{ id: 'v1', x: 200, y: 200 }]);
    const idB = addVectorNode([
      { id: 'v2', x: 200, y: 200 },
      { id: 'v3', x: 300, y: 200 },
    ]);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      mergeTarget: { nodeId: idB, vertexId: 'v2' },
      nodeId: idA,
      origins: { v1: { x: 200, y: 200 } },
      pointerStart: { x: 200, y: 200 },
    };

    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    const state = store.getState();

    expect(state.design.pages[state.design.activePageId].nodes[idB]).toBeUndefined();
    expect(state.design.pages[state.design.activePageId].nodes[idA]).toMatchObject({
      vertices: { v1: { id: 'v1', x: 200, y: 200 }, v3: { id: 'v3', x: 300, y: 200 } },
    });
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v1']);
  });
});
