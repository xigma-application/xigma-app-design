import { RefObject } from 'react';

// types
import { TAutoLayoutGapDragState } from 'types/design/canvas/types';

// utils
import { disarmAutoLayoutGapDrag } from '../disarmAutoLayoutGapDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

describe('disarmAutoLayoutGapDrag', () => {
  it('should do nothing when no gap drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const gapDragRef: RefObject<TAutoLayoutGapDragState | null> = { current: null };

    // before
    disarmAutoLayoutGapDrag(canvas, pointerEvent(), gapDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const dragState: TAutoLayoutGapDragState = {
      axis: 'horizontal',
      frameId: 'frame-1',
      originalGapValue: 30,
      point: { x: 50, y: 0 },
      pointerStart: { x: 50, y: 0 },
    };
    const gapDragRef: RefObject<TAutoLayoutGapDragState | null> = { current: dragState };

    // before
    disarmAutoLayoutGapDrag(canvas, pointerEvent(2), gapDragRef);

    // result
    expect(gapDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
