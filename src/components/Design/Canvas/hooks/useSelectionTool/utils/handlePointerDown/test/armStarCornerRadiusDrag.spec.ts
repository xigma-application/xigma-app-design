import { RefObject } from 'react';

// types

// utils
import { armStarCornerRadiusDrag } from '../armStarCornerRadiusDrag';
import { TStarCornerRadiusDragState } from 'types/design/canvas/types';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createStarCornerRadiusDragRef = (): RefObject<TStarCornerRadiusDragState | null> => ({ current: null });

describe('armStarCornerRadiusDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const starCornerRadiusDragRef = createStarCornerRadiusDragRef();

    // before
    armStarCornerRadiusDrag(
      canvas,
      pointerEvent(3),
      starCornerRadiusDragRef,
      { height: 100, width: 100, x: 0, y: 0 },
      'node-a',
      30,
      5,
      0.382,
      true,
      false,
    );

    // result
    expect(starCornerRadiusDragRef.current).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: true,
      flipY: false,
      hasMoved: false,
      nodeId: 'node-a',
      points: 5,
      ratio: 0.382,
      rotation: 30,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
