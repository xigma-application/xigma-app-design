// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { continueVectorMultiDrag } from '../continueVectorMultiDrag';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
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
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorMultiDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should do nothing when no multi-drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    continueVectorMultiDrag(canvas, pointerEvent(10, 10), store.dispatch, canvasRefs, setClassName);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should do nothing when none of the dragged vertices/handles resolve to any currently-open node', () => {
    // mock — vectorEditingNodeIds is empty, so the drag's own vertex origin can't be resolved to any node
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorMultiSelect.vectorMultiDragRef.current = {
      boxOrigin: null,
      dispatchThrottle: { frameId: null, run: null },
      handleOrigins: {},
      hasMoved: false,
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
      vertexOrigins: { v1: { x: 0, y: 0 } },
    };

    const setClassName = vi.fn();

    // before
    continueVectorMultiDrag(canvas, pointerEvent(10, 10), store.dispatch, canvasRefs, setClassName);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should translate every selected vertex and every selected handle by the same delta, and switch the cursor to move', () => {
    // mock
    const idA = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([idA]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorMultiSelect.vectorMultiDragRef.current = {
      boxOrigin: null,
      dispatchThrottle: { frameId: null, run: null },
      handleOrigins: { 'end:s1': { x: -5, y: 0 }, 'start:s1': { x: 5, y: 0 } },
      hasMoved: false,
      pendingClickAction: { id: 'v2', kind: 'vertex' },
      pointerStart: { x: 0, y: 0 },
      vertexOrigins: { v2: { x: 100, y: 0 } },
    };

    const setClassName = vi.fn();

    // before — cursor moved to (10, 40): delta (10, 40), well outside alignment tolerance of v1(0,0)
    continueVectorMultiDrag(canvas, pointerEvent(10, 40), store.dispatch, canvasRefs, setClassName);
    flushThrottledDispatch(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current!.dispatchThrottle);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    expect(node).toMatchObject({
      segments: { s1: { tangentEnd: { x: 5, y: 40 }, tangentStart: { x: 15, y: 40 } } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 110, y: 40 } },
    });
    expect(setClassName).toHaveBeenCalledWith('move');

    // result — a real move marks the drag as having moved, so a pending collapse won't fire on release
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.hasMoved).toBe(true);
  });

  it('should translate the canonical multi-select box by the same delta as the points, so it visually follows the drag instead of staying behind at its pre-drag position', () => {
    // mock — the box drag was armed with a snapshot of its own pre-drag bounds (boxOrigin)
    const idA = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([idA]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorMultiSelect.vectorMultiDragRef.current = {
      boxOrigin: { height: 0, width: 100, x: 0, y: 0 },
      dispatchThrottle: { frameId: null, run: null },
      handleOrigins: {},
      hasMoved: false,
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 } },
    };
    canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current = {
      bounds: { height: 0, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1,v2',
    };

    const setClassName = vi.fn();

    // before — cursor moved to (10, 4): delta (10, 4)
    continueVectorMultiDrag(canvas, pointerEvent(10, 4), store.dispatch, canvasRefs, setClassName);

    // result — the box's rotation and selection key stay untouched, only its position moves
    expect(canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toEqual({
      bounds: { height: 0, width: 100, x: 10, y: 4 },
      rotation: 0,
      selectionKey: 'v1,v2',
    });
  });

  it('should not touch the canonical box when this particular drag never snapshotted one (e.g. a plain segment/vertex drag, not a drag through the box itself)', () => {
    // mock
    const idA = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([idA]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorMultiSelect.vectorMultiDragRef.current = {
      boxOrigin: null,
      dispatchThrottle: { frameId: null, run: null },
      handleOrigins: {},
      hasMoved: false,
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
      vertexOrigins: { v1: { x: 0, y: 0 } },
    };
    canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current = {
      bounds: { height: 0, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1',
    };

    const setClassName = vi.fn();

    // before
    continueVectorMultiDrag(canvas, pointerEvent(10, 4), store.dispatch, canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toEqual({
      bounds: { height: 0, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1',
    });
  });

  it('should snap the whole dragged group by the same correction when only one of the dragged vertices touches an alignment guide, moving the box and every vertex/handle rigidly together', () => {
    // mock — v1 and v2 dragged together (box drag); a second, unrelated vector node has a vertex at
    // x=20, well within alignment tolerance of where v1 lands — the correction that snaps v1 onto it
    // must shift v2, the tangent handles, and the box by that exact same amount
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
    store.dispatch(setVectorEditingNodeIds([idA]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorMultiSelect.vectorMultiDragRef.current = {
      boxOrigin: { height: 0, width: 100, x: 0, y: 0 },
      dispatchThrottle: { frameId: null, run: null },
      handleOrigins: { 'end:s1': { x: -5, y: 0 }, 'start:s1': { x: 5, y: 0 } },
      hasMoved: false,
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 } },
    };
    canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current = {
      bounds: { height: 0, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1,v2',
    };

    const setClassName = vi.fn();

    // before — raw delta (22,350): v1 lands at (22,350), 2px off a's x=20 column
    continueVectorMultiDrag(canvas, pointerEvent(22, 350), store.dispatch, canvasRefs, setClassName);
    flushThrottledDispatch(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current!.dispatchThrottle);

    // result — every dragged element shifted by the same -2px x correction, keeping the group rigid
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    expect(node).toMatchObject({
      segments: { s1: { tangentEnd: { x: 15, y: 350 }, tangentStart: { x: 25, y: 350 } } },
      vertices: { v1: { id: 'v1', x: 20, y: 350 }, v2: { id: 'v2', x: 120, y: 350 } },
    });
    expect(canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toMatchObject({ bounds: { x: 20, y: 350 } });
    expect(canvasRefs.vectorEdit.vectorAlignmentGuideRef.current).not.toBeNull();
  });
});
