import { RefObject } from 'react';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TSliceDrawDragState, TSliceMoveDragState, TSliceResizeDragState, TSliceRotateDragState } from '../../../types';
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { handlePointerUp } from '../handlePointerUp';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.slice));
  });

  it('should disarm whichever drag is currently in progress', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: { height: 20, rotation: 0, width: 20, x: 0, y: 0 } };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: { start: { x: 0, y: 0 } } };
    const resizeDragRef: RefObject<TSliceResizeDragState | null> = { current: null };
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = { current: null };
    const moveDragRef: RefObject<TSliceMoveDragState | null> = { current: null };

    // before
    handlePointerUp(canvas, pointerEvent(2), sliceRef, drawDragRef, resizeDragRef, rotateDragRef, moveDragRef);

    // result
    expect(drawDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
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
    handlePointerUp(canvas, pointerEvent(2), sliceRef, drawDragRef, resizeDragRef, rotateDragRef, moveDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });
});
