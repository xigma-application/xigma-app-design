import { RefObject } from 'react';

// store
import { addNode, deleteNode, setViewport } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { continueSmartSelectionGapDrag } from '../continueSmartSelectionGapDrag';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, shiftKey = false): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, shiftKey });

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 50, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 50, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueSmartSelectionGapDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should do nothing when no gap drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const gapDragRef: RefObject<TSmartSelectionGapDragState | null> = { current: null };

    // before
    continueSmartSelectionGapDrag(canvas, pointerEvent(10, 10), store.dispatch, gapDragRef);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should grow the gap by the pointer delta and cascade the moving group', () => {
    // mock
    const idB = addRect(100, 0);
    const canvas = createCanvas();
    const dragState: TSmartSelectionGapDragState = {
      anchorPosition: 0,
      anchorSize: 50,
      axis: 'x',
      badgeAnchor: { x: 75, y: 25 },
      cascadeGroups: [{ nodeIds: [idB], originalPosition: 100, size: 50 }],
      currentGapValue: 50,
      dispatchThrottle: { frameId: null, run: null },
      gapIndex: 0,
      hasMoved: false,
      nodeOrigins: { [idB]: { x: 100, y: 0 } },
      originalGapValue: 50,
      pointerStart: { x: 75, y: 25 },
    };
    const gapDragRef: RefObject<TSmartSelectionGapDragState | null> = { current: dragState };

    // before — pointer moved 30 to the right
    continueSmartSelectionGapDrag(canvas, pointerEvent(105, 25), store.dispatch, gapDragRef);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — the handle's own midpoint only moves by half the gap growth (the anchor side is
    // fixed, only b's side moves), so the gap must grow by 2x the pointer delta (60) for the
    // midpoint to track the pointer 1:1; b moves to 0+50+110=160
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 160, y: 0 });
    expect(dragState.hasMoved).toBe(true);
    expect(dragState.badgeAnchor).toEqual({ x: 105, y: 25 });
  });

  it('should clamp the gap at 0 instead of going negative', () => {
    // mock
    const idB = addRect(100, 0);
    const canvas = createCanvas();
    const dragState: TSmartSelectionGapDragState = {
      anchorPosition: 0,
      anchorSize: 50,
      axis: 'x',
      badgeAnchor: { x: 75, y: 25 },
      cascadeGroups: [{ nodeIds: [idB], originalPosition: 100, size: 50 }],
      currentGapValue: 50,
      dispatchThrottle: { frameId: null, run: null },
      gapIndex: 0,
      hasMoved: false,
      nodeOrigins: { [idB]: { x: 100, y: 0 } },
      originalGapValue: 50,
      pointerStart: { x: 75, y: 25 },
    };
    const gapDragRef: RefObject<TSmartSelectionGapDragState | null> = { current: dragState };

    // before — pointer dragged far to the left, past a negative gap
    continueSmartSelectionGapDrag(canvas, pointerEvent(0, 25), store.dispatch, gapDragRef);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — gap floors at 0, b sits flush against the anchor's right edge (0+50+0=50)
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 50, y: 0 });
  });

  it('should snap the gap to the nearest 10 while shift is held', () => {
    // mock
    const idB = addRect(100, 0);
    const canvas = createCanvas();
    const dragState: TSmartSelectionGapDragState = {
      anchorPosition: 0,
      anchorSize: 50,
      axis: 'x',
      badgeAnchor: { x: 75, y: 25 },
      cascadeGroups: [{ nodeIds: [idB], originalPosition: 100, size: 50 }],
      currentGapValue: 50,
      dispatchThrottle: { frameId: null, run: null },
      gapIndex: 0,
      hasMoved: false,
      nodeOrigins: { [idB]: { x: 100, y: 0 } },
      originalGapValue: 50,
      pointerStart: { x: 75, y: 25 },
    };
    const gapDragRef: RefObject<TSmartSelectionGapDragState | null> = { current: dragState };

    // before — pointer moved 37 to the right with shift held: raw gap 50+2*37=124, snaps to 120
    continueSmartSelectionGapDrag(canvas, pointerEvent(112, 25, true), store.dispatch, gapDragRef);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — b moves to 0+50+120=170, not the unsnapped 174
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 170, y: 0 });
    expect(dragState.currentGapValue).toBe(120);
  });
});
