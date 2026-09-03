import { RefObject } from 'react';

// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { disarmSmartSelectionGapDrag } from '../disarmSmartSelectionGapDrag';

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

describe('disarmSmartSelectionGapDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should do nothing when no gap drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const gapDragRef: RefObject<TSmartSelectionGapDragState | null> = { current: null };

    // before
    disarmSmartSelectionGapDrag(canvas, pointerEvent(), gapDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should flush any pending throttled dispatch, clear the ref and release pointer capture', () => {
    // mock — a pending run that has not fired yet (no requestAnimationFrame flush in this test env)
    const idB = addRect(100, 0);
    const canvas = createCanvas();
    const dragState: TSmartSelectionGapDragState = {
      anchorPosition: 0,
      anchorSize: 50,
      axis: 'x',
      badgeAnchor: { x: 75, y: 25 },
      cascadeGroups: [{ nodeIds: [idB], originalPosition: 100, size: 50 }],
      currentGapValue: 50,
      dispatchThrottle: {
        frameId: 1,
        run: (): void => {
          store.dispatch({ payload: { changes: { x: 999 }, id: idB }, type: 'design/updateNode' });
        },
      },
      hasMoved: true,
      nodeOrigins: { [idB]: { x: 100, y: 0 } },
      originalGapValue: 50,
      pointerStart: { x: 75, y: 25 },
    };
    const gapDragRef: RefObject<TSmartSelectionGapDragState | null> = { current: dragState };

    // before
    disarmSmartSelectionGapDrag(canvas, pointerEvent(2), gapDragRef);

    // result — the pending run fired synchronously on flush
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 999 });
    expect(gapDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
