import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { disarmVectorMarqueeDrag } from '../disarmVectorMarqueeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createVectorMarqueeStartRef = (point: TPoint | null = null): RefObject<TPoint | null> => ({ current: point });

describe('disarmVectorMarqueeDrag', () => {
  it('should do nothing when no vector marquee is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    disarmVectorMarqueeDrag(canvas, pointerEvent(), canvasRefs, createVectorMarqueeStartRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the vector-marquee start ref and the shared marquee rect, and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({ marqueeRef: { current: { height: 10, width: 10, x: 0, y: 0 } } });
    const vectorMarqueeStartRef = createVectorMarqueeStartRef({ x: 5, y: 5 });

    // before
    disarmVectorMarqueeDrag(canvas, pointerEvent(2), canvasRefs, vectorMarqueeStartRef);

    // result
    expect(vectorMarqueeStartRef.current).toBeNull();
    expect(canvasRefs.marqueeRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
