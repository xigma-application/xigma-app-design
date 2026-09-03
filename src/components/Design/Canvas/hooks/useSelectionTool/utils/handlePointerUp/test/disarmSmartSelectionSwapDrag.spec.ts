import { RefObject } from 'react';

// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { disarmSmartSelectionSwapDrag } from '../disarmSmartSelectionSwapDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 50, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 50, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const nodes = (): Record<string, { x: number; y: number }> =>
  store.getState().design.pages[store.getState().design.activePageId].nodes as Record<string, { x: number; y: number }>;

describe('disarmSmartSelectionSwapDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should do nothing when no swap drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const swapDragRef: RefObject<TSmartSelectionSwapDragState | null> = { current: null };

    // before
    disarmSmartSelectionSwapDrag(canvas, pointerEvent(), store.dispatch, swapDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should snap every block onto its reordered slot, clear the ref and release pointer capture', () => {
    // mock — dragged block A left floating away from its slot, target is the third slot
    const idA = addRect(320, 40);
    const idB = addRect(100, 0);
    const idC = addRect(200, 0);
    const canvas = createCanvas();
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
    const swapDragRef: RefObject<TSmartSelectionSwapDragState | null> = { current: dragState };

    // before
    disarmSmartSelectionSwapDrag(canvas, pointerEvent(2), store.dispatch, swapDragRef);

    // result — [B, C, A] snapped onto the fixed slot origins
    expect(nodes()[idA]).toMatchObject({ x: 200, y: 0 });
    expect(nodes()[idB]).toMatchObject({ x: 0, y: 0 });
    expect(nodes()[idC]).toMatchObject({ x: 100, y: 0 });
    expect(swapDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should not touch the nodes when the drag never moved', () => {
    // mock
    const idA = addRect(320, 40);
    const canvas = createCanvas();
    const dragState: TSmartSelectionSwapDragState = {
      dispatchThrottle: { frameId: null, run: null },
      fromIndex: 0,
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 0, y: 0 } },
      pointerStart: { x: 25, y: 25 },
      slots: [{ bounds: { height: 50, width: 50, x: 0, y: 0 }, id: idA }],
      targetIndex: 0,
    };
    const swapDragRef: RefObject<TSmartSelectionSwapDragState | null> = { current: dragState };

    // before
    disarmSmartSelectionSwapDrag(canvas, pointerEvent(3), store.dispatch, swapDragRef);

    // result — position left exactly as it was
    expect(nodes()[idA]).toMatchObject({ x: 320, y: 40 });
    expect(swapDragRef.current).toBeNull();
  });
});
