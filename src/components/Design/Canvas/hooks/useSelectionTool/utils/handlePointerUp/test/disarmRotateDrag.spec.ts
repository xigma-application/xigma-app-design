import { RefObject } from 'react';

// types
import { TRotateDragState } from '../../../types';

// utils
import { disarmRotateDrag } from '../disarmRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createRotateDragRef = (rotateDragState: TRotateDragState | null = null): RefObject<TRotateDragState | null> => ({
  current: rotateDragState,
});

describe('disarmRotateDrag', () => {
  it('should do nothing when no rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmRotateDrag(canvas, pointerEvent(), createRotateDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the rotate-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: {},
      pivot: { x: 0, y: 0 },
      startAngle: 0,
    });

    // before
    disarmRotateDrag(canvas, pointerEvent(2), rotateDragRef);

    // result
    expect(rotateDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
