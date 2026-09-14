import { RefObject } from 'react';

// types
import { TGradientEndpointMoveDragState } from 'types/design/canvas/types';

// utils
import { armGradientEndpointMoveDrag } from '../armGradientEndpointMoveDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createGradientEndpointMoveDragRef = (): RefObject<TGradientEndpointMoveDragState | null> => ({ current: null });

describe('armGradientEndpointMoveDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const gradientEndpointMoveDragRef = createGradientEndpointMoveDragRef();

    // before
    armGradientEndpointMoveDrag(canvas, pointerEvent(3), gradientEndpointMoveDragRef, 'node-a', 0, 'start');

    // result
    expect(gradientEndpointMoveDragRef.current).toEqual({ endpoint: 'start', nodeId: 'node-a', paintIndex: 0 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
