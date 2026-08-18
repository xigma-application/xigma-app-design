import { RefObject } from 'react';

// types
import { TEllipseArcRatioDragState } from '../../../types';

// utils
import { armEllipseArcRatioDrag } from '../armEllipseArcRatioDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createEllipseArcRatioDragRef = (): RefObject<TEllipseArcRatioDragState | null> => ({ current: null });

describe('armEllipseArcRatioDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const ellipseArcRatioDragRef = createEllipseArcRatioDragRef();

    // before
    armEllipseArcRatioDrag(
      canvas,
      pointerEvent(3),
      ellipseArcRatioDragRef,
      { height: 100, width: 100, x: 0, y: 0 },
      'node-a',
      30,
      true,
      false,
    );

    // result
    expect(ellipseArcRatioDragRef.current).toEqual({
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
