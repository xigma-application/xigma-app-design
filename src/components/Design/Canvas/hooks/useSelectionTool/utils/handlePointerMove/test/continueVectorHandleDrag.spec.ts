// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { continueVectorHandleDrag } from '../continueVectorHandleDrag';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { createSelectionToolRefs } from '../../../hooks/useSelectionToolRefs/createSelectionToolRefs';

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

describe('continueVectorHandleDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no vector handle drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();
    const setClassName = vi.fn();

    // before
    continueVectorHandleDrag(canvas, pointerEvent(10, 10), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(store.getState().design.nodes).toEqual({});
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should do nothing when the drag points at a node that no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorHandleDragRef.current = { end: 'start', nodeId: 'missing-node', segmentId: 's1', vertexId: 'v1' };

    const setClassName = vi.fn();

    // before
    continueVectorHandleDrag(canvas, pointerEvent(10, 10), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(store.getState().design.nodes).toEqual({});
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should set the tangentStart on the dragged segment relative to the vertex and switch the cursor to move when dragging the "start" handle — angle well outside the snap tolerance, so the raw drag is used unchanged', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorHandleDragRef.current = { end: 'start', nodeId: idA, segmentId: 's1', vertexId: 'v1' };

    const setClassName = vi.fn();

    // before — atan2(5, 20) ≈ 14deg, outside the 5deg tolerance
    continueVectorHandleDrag(canvas, pointerEvent(20, 5), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ segments: { s1: { tangentStart: { x: 20, y: 5 } } } });
    expect(setClassName).toHaveBeenCalledWith('move');
    expect(canvasRefs.snappedVectorHandleRef.current).toBeNull();
  });

  it('should set the tangentEnd on the dragged segment relative to the vertex when dragging the "end" handle', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorHandleDragRef.current = { end: 'end', nodeId: idA, segmentId: 's1', vertexId: 'v2' };

    const setClassName = vi.fn();

    // before
    continueVectorHandleDrag(canvas, pointerEvent(120, 15), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ segments: { s1: { tangentEnd: { x: 20, y: 15 } } } });
  });

  it('should snap the tangent onto the exact axis and record the snapped handle when the drag angle is within tolerance', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorHandleDragRef.current = { end: 'start', nodeId: idA, segmentId: 's1', vertexId: 'v1' };

    const setClassName = vi.fn();

    // before — a couple of px off horizontal from v1(0,0), within the angle-snap tolerance
    continueVectorHandleDrag(canvas, pointerEvent(20, 1), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result — pulled onto the exact horizontal axis
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ segments: { s1: { tangentStart: { x: 20, y: 0 } } } });
    expect(canvasRefs.snappedVectorHandleRef.current).toEqual({ end: 'start', segmentId: 's1' });
  });

  it('should snap the dragged handle tip onto an alignment guide with a vertex on a completely separate vector node, and record the guide', () => {
    // mock — a second, unrelated vector node has a vertex at x=20, well within alignment tolerance of
    // the drag's own x — the tangent tip should snap onto that column instead of the raw drag x
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

    selectionRefs.vectorHandleDragRef.current = { end: 'start', nodeId: idA, segmentId: 's1', vertexId: 'v1' };

    const setClassName = vi.fn();

    // before — drag a couple of px off x=20, well outside cardinal angle-snap tolerance from v1(0,0)
    continueVectorHandleDrag(canvas, pointerEvent(22, 350), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result — snapped onto x=20, and the alignment guide is recorded
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ segments: { s1: { tangentStart: { x: 20, y: 350 } } } });
    expect(canvasRefs.vectorAlignmentGuideRef.current).not.toBeNull();
  });

  it('should clear a previously recorded snapped handle once the drag angle leaves the tolerance again', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorHandleDragRef.current = { end: 'start', nodeId: idA, segmentId: 's1', vertexId: 'v1' };
    canvasRefs.snappedVectorHandleRef.current = { end: 'start', segmentId: 's1' };

    // before — atan2(5, 20) ≈ 14deg, outside the tolerance
    continueVectorHandleDrag(canvas, pointerEvent(20, 5), store.dispatch, canvasRefs, selectionRefs, vi.fn());

    // result
    expect(canvasRefs.snappedVectorHandleRef.current).toBeNull();
  });
});
