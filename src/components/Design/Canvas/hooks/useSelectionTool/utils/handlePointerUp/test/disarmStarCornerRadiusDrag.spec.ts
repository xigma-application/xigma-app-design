import { RefObject } from 'react';

// types
import { TStarCornerRadiusDragState } from '../../../types';

// utils
import { disarmStarCornerRadiusDrag } from '../disarmStarCornerRadiusDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createStarCornerRadiusDragRef = (
  dragState: TStarCornerRadiusDragState | null = null,
): RefObject<TStarCornerRadiusDragState | null> => ({ current: dragState });

describe('disarmStarCornerRadiusDrag', () => {
  it('should do nothing when no star corner-radius drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmStarCornerRadiusDrag(canvas, pointerEvent(), createStarCornerRadiusDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the star corner-radius-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const starCornerRadiusDragRef = createStarCornerRadiusDragRef({
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      hasMoved: true,
      nodeId: 'node-a',
      points: 5,
      ratio: 0.382,
      rotation: 0,
    });

    // before
    disarmStarCornerRadiusDrag(canvas, pointerEvent(2), starCornerRadiusDragRef);

    // result
    expect(starCornerRadiusDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
