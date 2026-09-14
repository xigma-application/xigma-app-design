import { RefObject } from 'react';

// types
import { TGradientRotateDragState } from 'types/design/canvas/types';

// utils
import { armGradientRotateDrag } from '../armGradientRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createGradientRotateDragRef = (): RefObject<TGradientRotateDragState | null> => ({ current: null });

describe('armGradientRotateDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const gradientRotateDragRef = createGradientRotateDragRef();

    // before
    armGradientRotateDrag(
      canvas,
      pointerEvent(3),
      gradientRotateDragRef,
      'node-a',
      0,
      'start',
      { x: 5, y: 50 },
      'box',
      { x: 50, y: 50 },
      40,
      0.5,
    );

    // result
    expect(gradientRotateDragRef.current).toEqual({
      angleOffset: 0.5,
      draggedEndpoint: 'start',
      mode: 'box',
      nodeId: 'node-a',
      paintIndex: 0,
      pivot: { x: 50, y: 50 },
      pointerPosition: { x: 5, y: 50 },
      radius: 40,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
