// store
import { addNode, setActiveTool, setSelection, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { createSelectionToolRefs } from '../../../../hooks/useSelectionToolRefs/createSelectionToolRefs';
import { disarmVectorCutDrag } from '../disarmVectorCutDrag';
import { severVectorSegmentAtPoint } from 'utils/canvas/vectorNetwork/cutVectorNetwork/severVectorSegmentAtPoint';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

// a=(0,0) b=(100,0) c=(100,100) d=(0,100), s1 top / s2 right / s3 bottom / s4 left
const addSquareNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
        s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 100, y: 100 },
        d: { id: 'd', x: 0, y: 100 },
      },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('disarmVectorCutDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.cut));
  });

  it('should do nothing when no cut drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();
    const setClassNameMock = vi.fn();

    // before
    disarmVectorCutDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, setClassNameMock);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassNameMock).not.toHaveBeenCalled();
  });

  it('should commit a Split when the drag state is still "pending" (no drag past the threshold)', () => {
    // mock — a closed square: severing one edge still leaves it as a single open chain, so this
    // exercises the ordinary (stays-one-node) wiring path
    const nodeId = addSquareNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorCutDragRef.current = { hit: { nodeId, segmentId: 's1', t: 0.5 }, lineStart: { x: 50, y: 0 }, status: 'pending' };

    const setClassNameMock = vi.fn();

    // before
    disarmVectorCutDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, setClassNameMock);

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(node.segments)).toHaveLength(5);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(selectionRefs.vectorCutDragRef.current).toBeNull();
    expect(canvasRefs.vectorCut.vectorCutPreviewRef.current).toBeNull();
    expect(setClassNameMock).toHaveBeenCalledWith('cut-off');
    // a plain-click Split severs into two brand-new, disconnected vertex ids at the same point
    expect(canvasRefs.vectorCut.newVectorCutVertexIdsRef.current.size).toBe(2);
    // a completed cut hands control back to the Move tool
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should split into two separate nodes — updating vectorEditingNodeIds and pink-marking both sides — when the Split genuinely disconnects the network', () => {
    // mock — the square with its left edge (s4) already severed by an earlier Split, so this second
    // Split (right edge, s2) has nothing left bridging the two halves
    const nodeId = addSquareNode();
    const preSeveredNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const severedChanges = severVectorSegmentAtPoint(preSeveredNode, 's4', 0.5);

    store.dispatch(updateNode({ changes: severedChanges, id: nodeId }));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const { rootOrder: rootOrderBefore } = store.getState().design;
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorCutDragRef.current = { hit: { nodeId, segmentId: 's2', t: 0.5 }, lineStart: { x: 100, y: 50 }, status: 'pending' };

    // before
    disarmVectorCutDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, vi.fn());

    // result
    const newRootOrder = store.getState().design.rootOrder.filter((id) => !rootOrderBefore.includes(id));

    expect(newRootOrder).toHaveLength(1);
    expect([...store.getState().design.vectorEditingNodeIds].sort()).toEqual([nodeId, ...newRootOrder].sort());
    // both the original node's own new vertex AND the brand-new sibling's own new vertex get marked
    expect(canvasRefs.vectorCut.newVectorCutVertexIdsRef.current.size).toBe(2);
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should do nothing but still clean up refs/pointer capture when the "pending" drag never hit anything (a plain click on empty space)', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();
    const nodeBefore = store.getState().design.nodes[nodeId] as TVectorNode;

    selectionRefs.vectorCutDragRef.current = { hit: null, lineStart: { x: 500, y: 500 }, status: 'pending' };

    // before
    disarmVectorCutDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, vi.fn());

    // result
    expect(store.getState().design.nodes[nodeId]).toEqual(nodeBefore);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(selectionRefs.vectorCutDragRef.current).toBeNull();
    // nothing was actually cut, so the tool stays put
    expect(store.getState().design.activeTool).toBe(ToolName.cut);
  });

  it('should do nothing but still clean up refs/pointer capture when the "pending" drag\'s node no longer exists', () => {
    // mock — no node was ever added, so 'stale-node' resolves to nothing
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorCutDragRef.current = {
      hit: { nodeId: 'stale-node', segmentId: 's1', t: 0.5 },
      lineStart: { x: 50, y: 0 },
      status: 'pending',
    };

    // before
    disarmVectorCutDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, vi.fn());

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(selectionRefs.vectorCutDragRef.current).toBeNull();
  });

  it("should fall back to the drag's own lineStart (a zero-length cut, finding nothing) when the preview ref was never populated", () => {
    // mock — 'dividing' status reached with no prior continueVectorCutDrag frame ever having run
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorCutDragRef.current = { lineStart: { x: 50, y: 0 }, status: 'dividing' };
    canvasRefs.vectorCut.vectorCutPreviewRef.current = null;

    // before
    disarmVectorCutDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, vi.fn());

    // result — no crash, no dispatch of any kind (a zero-length line crosses nothing)
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments).toEqual({ s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } });
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    // nothing was actually cut, so the tool stays put
    expect(store.getState().design.activeTool).toBe(ToolName.cut);
  });

  it('should commit a Divide, using the preview ref\'s last line end, when the drag state is "dividing"', () => {
    // mock — square crossed by a horizontal line through the middle
    store.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {
          s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
          s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
          s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
          s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
        },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: {
          a: { id: 'a', x: 0, y: 0 },
          b: { id: 'b', x: 100, y: 0 },
          c: { id: 'c', x: 100, y: 100 },
          d: { id: 'd', x: 0, y: 100 },
        },
      }),
    );

    const { rootOrder: rootOrderBefore } = store.getState().design;
    const nodeId = rootOrderBefore[rootOrderBefore.length - 1];

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorCutDragRef.current = { lineStart: { x: -20, y: 50 }, status: 'dividing' };
    canvasRefs.vectorCut.vectorCutPreviewRef.current = { crossings: [], lineEnd: { x: 120, y: 50 }, lineStart: { x: -20, y: 50 } };

    // before
    disarmVectorCutDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, selectionRefs, vi.fn());

    // result
    const newRootOrder = store.getState().design.rootOrder.filter((id) => !rootOrderBefore.includes(id));

    expect(newRootOrder).toHaveLength(1);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(selectionRefs.vectorCutDragRef.current).toBeNull();
    expect(canvasRefs.vectorCut.vectorCutPreviewRef.current).toBeNull();
    // the original node id keeps one of the two divided pieces, gaining new severed vertex ids at its crossings
    expect(canvasRefs.vectorCut.newVectorCutVertexIdsRef.current.size).toBeGreaterThan(0);
    // a completed cut hands control back to the Move tool
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });
});
