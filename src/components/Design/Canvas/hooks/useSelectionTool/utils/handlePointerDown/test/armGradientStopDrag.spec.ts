import { RefObject } from 'react';

// types
import { TGradientStopDragState } from 'types/design/canvas/types';

// utils
import { armGradientStopDrag } from '../armGradientStopDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createGradientStopDragRef = (): RefObject<TGradientStopDragState | null> => ({ current: null });

describe('armGradientStopDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const gradientStopDragRef = createGradientStopDragRef();

    // before
    armGradientStopDrag(canvas, pointerEvent(3), gradientStopDragRef, 'node-a', 0, 1, '#ffffff', 100);

    // result
    expect(gradientStopDragRef.current).toEqual({
      color: '#ffffff',
      draggedStopIndex: 1,
      nodeId: 'node-a',
      opacity: 100,
      paintIndex: 0,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
