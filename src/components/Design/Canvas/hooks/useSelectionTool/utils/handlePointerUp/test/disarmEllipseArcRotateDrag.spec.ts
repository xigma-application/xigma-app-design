import { RefObject } from 'react';

// types
import { TEllipseArcRotateDragState } from '../../../types';

// utils
import { disarmEllipseArcRotateDrag } from '../disarmEllipseArcRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createEllipseArcRotateDragRef = (
  dragState: TEllipseArcRotateDragState | null = null,
): RefObject<TEllipseArcRotateDragState | null> => ({ current: dragState });

describe('disarmEllipseArcRotateDrag', () => {
  it('should do nothing when no ellipse-arc rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmEllipseArcRotateDrag(canvas, pointerEvent(), createEllipseArcRotateDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the ellipse-arc-rotate-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const ellipseArcRotateDragRef = createEllipseArcRotateDragRef({
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: 'node-a',
      rotation: 0,
    });

    // before
    disarmEllipseArcRotateDrag(canvas, pointerEvent(2), ellipseArcRotateDragRef);

    // result
    expect(ellipseArcRotateDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
