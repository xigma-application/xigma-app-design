import { RefObject } from 'react';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { disarmMarqueeDrag } from '../disarmMarqueeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createMarqueeStartRef = (point: TPoint | null = null): RefObject<TPoint | null> => ({ current: point });
const createMarqueeRef = (rect: TDraftRect | null = null): RefObject<TDraftRect | null> => ({ current: rect });

describe('disarmMarqueeDrag', () => {
  it('should do nothing when no marquee drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmMarqueeDrag(canvas, pointerEvent(), createMarqueeStartRef(), createMarqueeRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the marquee start and preview refs and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const marqueeStartRef = createMarqueeStartRef({ x: 10, y: 10 });
    const marqueeRef = createMarqueeRef({ height: 5, width: 5, x: 10, y: 10 });

    // before
    disarmMarqueeDrag(canvas, pointerEvent(3), marqueeStartRef, marqueeRef);

    // result
    expect(marqueeStartRef.current).toBeNull();
    expect(marqueeRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(3);
  });
});
