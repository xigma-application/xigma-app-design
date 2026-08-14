import { RefObject } from 'react';

// types
import { TPathOffsetDragState } from '../../../types';

// utils
import { disarmPathOffsetDrag } from '../disarmPathOffsetDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createPathOffsetDragRef = (dragState: TPathOffsetDragState | null = null): RefObject<TPathOffsetDragState | null> => ({
  current: dragState,
});

describe('disarmPathOffsetDrag', () => {
  it('should do nothing when no path-offset drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmPathOffsetDrag(canvas, pointerEvent(), createPathOffsetDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the path-offset-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const pathOffsetDragRef = createPathOffsetDragRef({ nodeId: 'text-1' });

    // before
    disarmPathOffsetDrag(canvas, pointerEvent(2), pathOffsetDragRef);

    // result
    expect(pathOffsetDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
