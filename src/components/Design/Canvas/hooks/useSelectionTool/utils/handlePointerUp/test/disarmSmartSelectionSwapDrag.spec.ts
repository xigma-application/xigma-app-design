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

describe('disarmSmartSelectionSwapDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should do nothing when no swap drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const swapDragRef: RefObject<TSmartSelectionSwapDragState | null> = { current: null };

    // before
    disarmSmartSelectionSwapDrag(canvas, pointerEvent(), swapDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should flush any pending throttled dispatch, clear the ref and release pointer capture', () => {
    // mock
    const idA = addRect(0, 0);
    const canvas = createCanvas();
    const dragState: TSmartSelectionSwapDragState = {
      dispatchThrottle: {
        frameId: 1,
        run: (): void => {
          store.dispatch({ payload: { changes: { x: 999 }, id: idA }, type: 'design/updateNode' });
        },
      },
      fromIndex: 0,
      hasMoved: true,
      nodeOrigins: { [idA]: { x: 0, y: 0 } },
      pointerStart: { x: 25, y: 25 },
      slots: [{ bounds: { height: 50, width: 50, x: 0, y: 0 }, id: idA }],
      targetIndex: 0,
    };
    const swapDragRef: RefObject<TSmartSelectionSwapDragState | null> = { current: dragState };

    // before
    disarmSmartSelectionSwapDrag(canvas, pointerEvent(2), swapDragRef);

    // result — the pending run fired synchronously on flush
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({ x: 999 });
    expect(swapDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
