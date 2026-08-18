import { RefObject } from 'react';

// types
import { TCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { disarmCornerRadiusDrag } from '../disarmCornerRadiusDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createCornerRadiusDragRef = (
  cornerRadiusDragState: TCornerRadiusDragState | null = null,
): RefObject<TCornerRadiusDragState | null> => ({
  current: cornerRadiusDragState,
});

describe('disarmCornerRadiusDrag', () => {
  it('should do nothing when no corner-radius drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmCornerRadiusDrag(canvas, pointerEvent(), createCornerRadiusDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the corner-radius-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const cornerRadiusDragRef = createCornerRadiusDragRef({
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      candidates: ['se'],
      corner: 'se',
      hasMoved: true,
      nodeId: 'node-a',
      pointerStart: { x: 10, y: 10 },
      rotation: 0,
    });

    // before
    disarmCornerRadiusDrag(canvas, pointerEvent(2), cornerRadiusDragRef);

    // result
    expect(cornerRadiusDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
