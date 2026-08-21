// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

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

const addVectorNode = (vertices: { id: string; x: number; y: number }[]): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: Object.fromEntries(vertices.map((vertex) => [vertex.id, vertex])),
    }),
  );

  const { rootOrder } = store.getState().design;

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

    selectionRefs.vectorVertexDragRef.current = { nodeId: 'path-1', origins: { 'vertex-1': { x: 0, y: 0 } }, pointerStart: { x: 5, y: 5 } };
    canvasRefs.vectorAlignmentGuideRef.current = {
      horizontal: null,
      vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 0 } },
    };

    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(selectionRefs.vectorVertexDragRef.current).toBeNull();
    expect(canvasRefs.vectorAlignmentGuideRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should do nothing merge-related when the drag points at a node that no longer exists, even with a merge target recorded', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      mergeTarget: { nodeId: 'missing-target', vertexId: 'v2' },
      nodeId: 'missing-node',
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };

    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(selectionRefs.vectorVertexDragRef.current).toBeNull();
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
      mergeTarget: { nodeId: idA, vertexId: 'v2' },
      nodeId: idA,
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };

    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ vertices: { v1: { id: 'v1', x: 100, y: 0 } } });
    expect(Object.keys(node.vertices)).not.toContain('v2');
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(store.getState().design.nodes[idA]).toBeDefined();
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

    expect(state.design.nodes[idB]).toBeUndefined();
    expect(state.design.nodes[idA]).toMatchObject({ vertices: { v1: { id: 'v1', x: 200, y: 200 }, v3: { id: 'v3', x: 300, y: 200 } } });
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
  });
});
