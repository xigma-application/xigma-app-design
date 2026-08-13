import { RefObject } from 'react';

// types
import { TResizeDragState } from '../../../types';

// utils
import { disarmResizeDrag } from '../disarmResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createResizeDragRef = (resizeDragState: TResizeDragState | null = null): RefObject<TResizeDragState | null> => ({
  current: resizeDragState,
});

describe('disarmResizeDrag', () => {
  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmResizeDrag(canvas, pointerEvent(), createResizeDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the resize-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: {},
    });

    // before
    disarmResizeDrag(canvas, pointerEvent(2), resizeDragRef);

    // result
    expect(resizeDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
