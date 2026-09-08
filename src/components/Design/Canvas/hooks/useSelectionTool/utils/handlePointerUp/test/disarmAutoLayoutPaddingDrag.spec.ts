import { RefObject } from 'react';

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
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: null };

    // before
    disarmAutoLayoutPaddingDrag(canvas, pointerEvent(), paddingDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId: 'frame-1',
      mode: 'absolute',
      originalPaddingValue: 0,
      point: { x: 0, y: 100 },
      pointerStart: { x: 0, y: 100 },
      side: 'left',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before
    disarmAutoLayoutPaddingDrag(canvas, pointerEvent(2), paddingDragRef);

    // result
    expect(paddingDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
