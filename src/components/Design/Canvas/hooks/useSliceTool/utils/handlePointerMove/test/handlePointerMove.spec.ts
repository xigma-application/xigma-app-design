import { RefObject } from 'react';

// types
import { TSliceDraft, TSliceDrawDragState, TSliceMoveDragState, TSliceResizeDragState, TSliceRotateDragState } from '../../../types';

// utils
import { handlePointerMove } from '../handlePointerMove';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

describe('handlePointerMove', () => {
  it('should route to the armed draw drag and update the slice ref', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: { start: { x: 0, y: 0 } } };
    const resizeDragRef: RefObject<TSliceResizeDragState | null> = { current: null };
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = { current: null };
    const moveDragRef: RefObject<TSliceMoveDragState | null> = { current: null };

    // before
    handlePointerMove(canvas, pointerEvent(40, 30), sliceRef, drawDragRef, resizeDragRef, rotateDragRef, moveDragRef);

    // result
    expect(sliceRef.current).toEqual({ height: 30, rotation: 0, width: 40, x: 0, y: 0 });
  });

  it('should do nothing when no drag is armed', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: null };
    const resizeDragRef: RefObject<TSliceResizeDragState | null> = { current: null };
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = { current: null };
    const moveDragRef: RefObject<TSliceMoveDragState | null> = { current: null };

    // before
    handlePointerMove(canvas, pointerEvent(40, 30), sliceRef, drawDragRef, resizeDragRef, rotateDragRef, moveDragRef);

    // result
    expect(sliceRef.current).toBeNull();
  });
});
