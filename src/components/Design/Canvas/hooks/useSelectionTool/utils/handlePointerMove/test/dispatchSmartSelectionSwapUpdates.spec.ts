// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { dispatchSmartSelectionSwapUpdates } from '../dispatchSmartSelectionSwapUpdates';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 50, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 50, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const nodes = (): Record<string, { x: number; y: number }> =>
  store.getState().design.pages[store.getState().design.activePageId].nodes as Record<string, { x: number; y: number }>;

describe('dispatchSmartSelectionSwapUpdates', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should move the dragged block by its pointer delta and slot-snap the blocks it passed', () => {
    // mock — 3 rects in a row at x 0 / 100 / 200
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(200, 0);
    const dragState: TSmartSelectionSwapDragState = {
      dispatchThrottle: { frameId: null, run: null },
      fromIndex: 0,
      hasMoved: true,
      nodeOrigins: { [idA]: { x: 0, y: 0 }, [idB]: { x: 100, y: 0 }, [idC]: { x: 200, y: 0 } },
      pointerStart: { x: 25, y: 25 },
      slots: [
        { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: idA },
        { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: idB },
        { bounds: { height: 50, width: 50, x: 200, y: 0 }, id: idC },
      ],
      targetIndex: 2,
    };

    // action — dragged 150 right, 5 down
    dispatchSmartSelectionSwapUpdates(store.dispatch, dragState, 150, 5);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — A follows the cursor; B and C slide into the two freed slots
    expect(nodes()[idA]).toMatchObject({ x: 150, y: 5 });
    expect(nodes()[idB]).toMatchObject({ x: 0, y: 0 });
    expect(nodes()[idC]).toMatchObject({ x: 100, y: 0 });
  });

  it('should slot-snap grid cells across rows while the dragged cell tracks the pointer', () => {
    // mock — 2x2 grid
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(0, 100);
    const idD = addRect(100, 100);
    const dragState: TSmartSelectionSwapDragState = {
      dispatchThrottle: { frameId: null, run: null },
      fromIndex: 0,
      hasMoved: true,
      nodeOrigins: { [idA]: { x: 0, y: 0 }, [idB]: { x: 100, y: 0 }, [idC]: { x: 0, y: 100 }, [idD]: { x: 100, y: 100 } },
      pointerStart: { x: 25, y: 25 },
      slots: [
        { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: idA },
        { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: idB },
        { bounds: { height: 50, width: 50, x: 0, y: 100 }, id: idC },
        { bounds: { height: 50, width: 50, x: 100, y: 100 }, id: idD },
      ],
      targetIndex: 3,
    };

    // action — A dragged down-right by 90 / 95
    dispatchSmartSelectionSwapUpdates(store.dispatch, dragState, 90, 95);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — A floats with the cursor, the rest slide up one slot
    expect(nodes()[idA]).toMatchObject({ x: 90, y: 95 });
    expect(nodes()[idB]).toMatchObject({ x: 0, y: 0 });
    expect(nodes()[idC]).toMatchObject({ x: 100, y: 0 });
    expect(nodes()[idD]).toMatchObject({ x: 0, y: 100 });
  });

  it('should skip empty grid slots that carry no node id', () => {
    // mock — 3 filled cells and one hole (null slot) in a 2x2 grid
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(0, 100);
    const dragState: TSmartSelectionSwapDragState = {
      dispatchThrottle: { frameId: null, run: null },
      fromIndex: 0,
      hasMoved: true,
      nodeOrigins: { [idA]: { x: 0, y: 0 }, [idB]: { x: 100, y: 0 }, [idC]: { x: 0, y: 100 } },
      pointerStart: { x: 25, y: 25 },
      slots: [
        { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: idA },
        { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: idB },
        { bounds: { height: 50, width: 50, x: 0, y: 100 }, id: idC },
        { bounds: { height: 50, width: 50, x: 100, y: 100 }, id: null },
      ],
      targetIndex: 2,
    };

    // action
    dispatchSmartSelectionSwapUpdates(store.dispatch, dragState, 40, 45);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — the dragged cell tracks the pointer, the filled cells slide, the hole is ignored
    expect(nodes()[idA]).toMatchObject({ x: 40, y: 45 });
    expect(nodes()[idB]).toMatchObject({ x: 0, y: 0 });
    expect(nodes()[idC]).toMatchObject({ x: 100, y: 0 });
  });

  it('should only move the dragged block when the target index still equals the from index', () => {
    // mock
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const dragState: TSmartSelectionSwapDragState = {
      dispatchThrottle: { frameId: null, run: null },
      fromIndex: 0,
      hasMoved: true,
      nodeOrigins: { [idA]: { x: 0, y: 0 }, [idB]: { x: 100, y: 0 } },
      pointerStart: { x: 25, y: 25 },
      slots: [
        { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: idA },
        { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: idB },
      ],
      targetIndex: 0,
    };

    // action
    dispatchSmartSelectionSwapUpdates(store.dispatch, dragState, 12, -8);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result
    expect(nodes()[idA]).toMatchObject({ x: 12, y: -8 });
    expect(nodes()[idB]).toMatchObject({ x: 100, y: 0 });
  });
});
