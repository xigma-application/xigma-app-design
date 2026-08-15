import { RefObject } from 'react';

// types
import { TSliceRotateDragState } from '../../../types';

// utils
import { disarmRotateDrag } from '../disarmRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

describe('disarmRotateDrag', () => {
  it('should do nothing when no rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = { current: null };

    // before
    disarmRotateDrag(canvas, pointerEvent(), rotateDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the rotate drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = {
      current: {
        cursorAngle: 0,
        origin: { height: 10, rotation: 0, width: 10, x: 0, y: 0 },
        pivot: { x: 5, y: 5 },
        startAngle: 0,
      },
    };

    // before
    disarmRotateDrag(canvas, pointerEvent(3), rotateDragRef);

    // result
    expect(rotateDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(3);
  });
});
