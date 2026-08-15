import { RefObject } from 'react';

// types
import { TSliceMoveDragState } from '../../../types';

// utils
import { disarmMoveDrag } from '../disarmMoveDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

describe('disarmMoveDrag', () => {
  it('should do nothing when no move drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const moveDragRef: RefObject<TSliceMoveDragState | null> = { current: null };

    // before
    disarmMoveDrag(canvas, pointerEvent(), moveDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the move drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const moveDragRef: RefObject<TSliceMoveDragState | null> = {
      current: { origin: { height: 10, rotation: 0, width: 10, x: 0, y: 0 }, pointerStart: { x: 5, y: 5 } },
    };

    // before
    disarmMoveDrag(canvas, pointerEvent(3), moveDragRef);

    // result
    expect(moveDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(3);
  });
});
