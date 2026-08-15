import { RefObject } from 'react';

// types
import { TSliceResizeDragState } from '../../../types';

// utils
import { disarmResizeDrag } from '../disarmResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

describe('disarmResizeDrag', () => {
  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef: RefObject<TSliceResizeDragState | null> = { current: null };

    // before
    disarmResizeDrag(canvas, pointerEvent(), resizeDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the resize drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef: RefObject<TSliceResizeDragState | null> = {
      current: { bounds: { height: 10, rotation: 0, width: 10, x: 0, y: 0 }, handle: 'se' },
    };

    // before
    disarmResizeDrag(canvas, pointerEvent(3), resizeDragRef);

    // result
    expect(resizeDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(3);
  });
});
