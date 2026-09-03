import { RefObject } from 'react';

// store
import { addNode, deleteNode, setViewport } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { continueSmartSelectionSwapDrag } from '../continueSmartSelectionSwapDrag';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 50, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 50, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const nodes = (): Record<string, { x: number; y: number }> =>
  store.getState().design.pages[store.getState().design.activePageId].nodes as Record<string, { x: number; y: number }>;

const makeDragState = (idA: string, idB: string, idC: string): TSmartSelectionSwapDragState => ({
  dispatchThrottle: { frameId: null, run: null },
  fromIndex: 0,
  hasMoved: false,
  nodeOrigins: { [idA]: { x: 0, y: 0 }, [idB]: { x: 100, y: 0 }, [idC]: { x: 200, y: 0 } },
  pointerStart: { x: 25, y: 25 },
  slots: [
    { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: idA },
    { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: idB },
    { bounds: { height: 50, width: 50, x: 200, y: 0 }, id: idC },
  ],
  targetIndex: 0,
});

describe('continueSmartSelectionSwapDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should do nothing when no swap drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const swapDragRef: RefObject<TSmartSelectionSwapDragState | null> = { current: null };

    // before
    continueSmartSelectionSwapDrag(canvas, pointerEvent(10, 10), store.dispatch, swapDragRef);

    // result
    expect(nodes()).toEqual({});
  });

  it('should retarget to the slot nearest the pointer and reorder the row with shift', () => {
    // mock
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(200, 0);
    const canvas = createCanvas();
    const dragState = makeDragState(idA, idB, idC);
    const swapDragRef: RefObject<TSmartSelectionSwapDragState | null> = { current: dragState };

    // before — pointer over the third slot centre (x 225)
    continueSmartSelectionSwapDrag(canvas, pointerEvent(225, 25), store.dispatch, swapDragRef);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — targetIndex tracked to 2, layout reordered to [B, C, A]
    expect(dragState.targetIndex).toBe(2);
    expect(dragState.hasMoved).toBe(true);
    expect(nodes()[idA]).toMatchObject({ x: 200, y: 0 });
    expect(nodes()[idB]).toMatchObject({ x: 0, y: 0 });
    expect(nodes()[idC]).toMatchObject({ x: 100, y: 0 });
  });

  it('should not dispatch again while the pointer stays over the same slot', () => {
    // mock
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(200, 0);
    const canvas = createCanvas();
    const dragState = makeDragState(idA, idB, idC);
    const swapDragRef: RefObject<TSmartSelectionSwapDragState | null> = { current: dragState };

    // before — two moves both nearest slot 0 (its own slot)
    continueSmartSelectionSwapDrag(canvas, pointerEvent(10, 25), store.dispatch, swapDragRef);
    continueSmartSelectionSwapDrag(canvas, pointerEvent(20, 25), store.dispatch, swapDragRef);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — never left slot 0, nothing moved
    expect(dragState.targetIndex).toBe(0);
    expect(nodes()[idA]).toMatchObject({ x: 0, y: 0 });
    expect(nodes()[idC]).toMatchObject({ x: 200, y: 0 });
  });
});
