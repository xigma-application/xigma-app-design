// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { continueVectorVertexDrag } from '../continueVectorVertexDrag';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { createSelectionToolRefs } from '../../../../hooks/useSelectionToolRefs/createSelectionToolRefs';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
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

describe('continueVectorVertexDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no vector vertex drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();
    const setClassName = vi.fn();

    // before
    continueVectorVertexDrag(canvas, pointerEvent(10, 10), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(store.getState().design.nodes).toEqual({});
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should do nothing when the drag points at a node that no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      nodeId: 'missing-node',
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };

    const setClassName = vi.fn();

    // before
    continueVectorVertexDrag(canvas, pointerEvent(10, 10), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(store.getState().design.nodes).toEqual({});
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should translate only the dragged vertices, leaving the rest untouched, and switch the cursor to move', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      nodeId: idA,
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };

    const setClassName = vi.fn();

    // before — well outside alignment tolerance of v2(100,0)
    continueVectorVertexDrag(canvas, pointerEvent(15, 7), store.dispatch, canvasRefs, selectionRefs, setClassName);
    flushThrottledDispatch(selectionRefs.vectorVertexDragRef.current!.dispatchThrottle);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({
      vertices: { v1: { id: 'v1', x: 15, y: 7 }, v2: { id: 'v2', x: 100, y: 0 } },
    });
    expect(setClassName).toHaveBeenCalledWith('move');
    expect(canvasRefs.vectorEdit.vectorAlignmentGuideRef.current).toBeNull();
  });

  it('should snap a single dragged vertex onto an alignment guide with a vertex on a completely separate vector node, and record the guide', () => {
    // mock — a second, unrelated vector node has a vertex at x=20, well within alignment tolerance of
    // the drag's own raw x — the dragged vertex should snap onto that column
    const idA = addVectorNode();

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
        vertices: { a: { id: 'a', x: 20, y: 900 } },
      }),
    );

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      nodeId: idA,
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };

    const setClassName = vi.fn();

    // before — v1 dragged a couple of px off x=20
    continueVectorVertexDrag(canvas, pointerEvent(22, 350), store.dispatch, canvasRefs, selectionRefs, setClassName);
    flushThrottledDispatch(selectionRefs.vectorVertexDragRef.current!.dispatchThrottle);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ vertices: { v1: { id: 'v1', x: 20, y: 350 } } });
    expect(canvasRefs.vectorEdit.vectorAlignmentGuideRef.current).not.toBeNull();
  });

  it('should snap the whole dragged group by the same correction when only ONE of several selected vertices touches an alignment guide, keeping the group rigid', () => {
    // mock — v1 and v2 dragged together (group translate); only v1 ends up near an external vertex's
    // column, but the correction that snaps v1 onto it must shift v2 by the exact same amount
    const idA = addVectorNode();

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
        vertices: { a: { id: 'a', x: 20, y: 900 } },
      }),
    );

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      nodeId: idA,
      origins: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };

    const setClassName = vi.fn();

    // before — raw delta (22,350): v1 lands at (22,350), 2px off the a's x=20 column; v2 lands at (122,350)
    continueVectorVertexDrag(canvas, pointerEvent(22, 350), store.dispatch, canvasRefs, selectionRefs, setClassName);
    flushThrottledDispatch(selectionRefs.vectorVertexDragRef.current!.dispatchThrottle);

    // result — both vertices shifted by the same -2px x correction, keeping the group rigid
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({
      vertices: { v1: { id: 'v1', x: 20, y: 350 }, v2: { id: 'v2', x: 120, y: 350 } },
    });
    expect(canvasRefs.vectorEdit.vectorAlignmentGuideRef.current).not.toBeNull();
  });

  it('should snap a single dragged vertex exactly onto another vertex of the SAME node when within merge tolerance, record the merge target, and switch the cursor to point', () => {
    // mock — coordinates far from any other vertex this file's other tests leave lying around in the
    // (unreset between tests) store, so the merge target found below is unambiguously this node's own
    const idA = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { vertices: { v1: { id: 'v1', x: 5000, y: 0 }, v2: { id: 'v2', x: 5100, y: 0 } } },
        id: idA,
      }),
    );

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      nodeId: idA,
      origins: { v1: { x: 5000, y: 0 } },
      pointerStart: { x: 5000, y: 0 },
    };

    const setClassName = vi.fn();

    // before
    continueVectorVertexDrag(canvas, pointerEvent(5102, 1), store.dispatch, canvasRefs, selectionRefs, setClassName);
    flushThrottledDispatch(selectionRefs.vectorVertexDragRef.current!.dispatchThrottle);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ vertices: { v1: { id: 'v1', x: 5100, y: 0 } } });
    expect(selectionRefs.vectorVertexDragRef.current?.mergeTarget).toEqual({ nodeId: idA, vertexId: 'v2' });
    expect(canvasRefs.vectorEdit.vectorAlignmentGuideRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('point');
  });

  it('should detect a merge target belonging to a DIFFERENT vector node, not just the one being edited', () => {
    // mock — a separate node has a vertex within merge tolerance of the drag
    const idA = addVectorNode();

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
        vertices: { other: { id: 'other', x: 500, y: 500 } },
      }),
    );

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = {
      dispatchThrottle: { frameId: null, run: null },
      nodeId: idA,
      origins: { v1: { x: 500, y: 500 } },
      pointerStart: { x: 500, y: 500 },
    };

    const setClassName = vi.fn();

    // before — v1 dragged to (500,500), exactly onto the other node's vertex
    continueVectorVertexDrag(canvas, pointerEvent(500, 500), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(selectionRefs.vectorVertexDragRef.current?.mergeTarget?.vertexId).toBe('other');
    expect(selectionRefs.vectorVertexDragRef.current?.mergeTarget?.nodeId).not.toBe(idA);
    expect(setClassName).toHaveBeenCalledWith('point');
  });

  it('should clear a previously recorded merge target and restore the move cursor once dragged back out of tolerance', () => {
    // mock
    const idA = addVectorNode();
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

    // before — well outside merge tolerance of v2(100,0)
    continueVectorVertexDrag(canvas, pointerEvent(15, 7), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(selectionRefs.vectorVertexDragRef.current?.mergeTarget).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('move');
  });
});
