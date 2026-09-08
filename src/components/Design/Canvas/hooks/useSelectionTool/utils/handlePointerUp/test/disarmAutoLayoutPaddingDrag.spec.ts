import { RefObject } from 'react';

// store
import { startAutoLayoutPaddingEdit } from 'store/design/slice';

// types
import { TAutoLayoutPaddingDragState } from 'types/design/canvas/types';

// utils
import { disarmAutoLayoutPaddingDrag } from '../disarmAutoLayoutPaddingDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

describe('disarmAutoLayoutPaddingDrag', () => {
  it('should do nothing when no padding drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: null };

    // before
    disarmAutoLayoutPaddingDrag(canvas, pointerEvent(), dispatch, paddingDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should clear the ref and release pointer capture without opening the edit popup when the pointer moved', () => {
    // mock
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId: 'frame-1',
      hasMoved: true,
      mode: 'absolute',
      originalPaddingValue: 0,
      point: { x: 0, y: 100 },
      pointerStart: { x: 0, y: 100 },
      side: 'left',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before
    disarmAutoLayoutPaddingDrag(canvas, pointerEvent(2), dispatch, paddingDragRef);

    // result
    expect(paddingDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should open the edit popup for the clicked handle when the pointer never moved', () => {
    // mock
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId: 'frame-1',
      hasMoved: false,
      mode: 'absolute',
      originalPaddingValue: 0,
      point: { x: 0, y: 100 },
      pointerStart: { x: 0, y: 100 },
      side: 'left',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before
    disarmAutoLayoutPaddingDrag(canvas, pointerEvent(2), dispatch, paddingDragRef);

    // result
    expect(paddingDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(dispatch).toHaveBeenCalledWith(startAutoLayoutPaddingEdit({ frameId: 'frame-1', point: { x: 0, y: 100 }, side: 'left' }));
  });
});
