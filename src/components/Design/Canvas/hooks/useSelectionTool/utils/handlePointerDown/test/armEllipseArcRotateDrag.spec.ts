import { RefObject } from 'react';

// types
import { TEllipseArcRotateDragState } from '../../../types';

// utils
import { armEllipseArcRotateDrag } from '../armEllipseArcRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createEllipseArcRotateDragRef = (): RefObject<TEllipseArcRotateDragState | null> => ({ current: null });

describe('armEllipseArcRotateDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const ellipseArcRotateDragRef = createEllipseArcRotateDragRef();

    // before
    armEllipseArcRotateDrag(
      canvas,
      pointerEvent(3),
      ellipseArcRotateDragRef,
      { height: 100, width: 100, x: 0, y: 0 },
      'node-a',
      30,
      true,
      false,
    );

    // result
    expect(ellipseArcRotateDragRef.current).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      draggedHandlePosition: null,
      flipX: true,
      flipY: false,
      nodeId: 'node-a',
      rotation: 30,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
