import { RefObject } from 'react';

// types
import { TGradientRadiusDragState } from 'types/design/canvas/types';

// utils
import { armGradientRadiusDrag } from '../armGradientRadiusDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createGradientRadiusDragRef = (): RefObject<TGradientRadiusDragState | null> => ({ current: null });

describe('armGradientRadiusDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const gradientRadiusDragRef = createGradientRadiusDragRef();

    // before
    armGradientRadiusDrag(canvas, pointerEvent(3), gradientRadiusDragRef, 'node-a', 0);

    // result
    expect(gradientRadiusDragRef.current).toEqual({ nodeId: 'node-a', paintIndex: 0 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
