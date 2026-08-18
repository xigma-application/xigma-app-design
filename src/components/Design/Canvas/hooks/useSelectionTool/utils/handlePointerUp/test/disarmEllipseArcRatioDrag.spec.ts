import { RefObject } from 'react';

// types

// utils
import { disarmEllipseArcRatioDrag } from '../disarmEllipseArcRatioDrag';
import { TEllipseArcRatioDragState } from 'types/design/canvas/types';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createEllipseArcRatioDragRef = (dragState: TEllipseArcRatioDragState | null = null): RefObject<TEllipseArcRatioDragState | null> => ({
  current: dragState,
});

describe('disarmEllipseArcRatioDrag', () => {
  it('should do nothing when no ellipse-arc ratio drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmEllipseArcRatioDrag(canvas, pointerEvent(), createEllipseArcRatioDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the ellipse-arc-ratio-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const ellipseArcRatioDragRef = createEllipseArcRatioDragRef({
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: 'node-a',
      rotation: 0,
    });

    // before
    disarmEllipseArcRatioDrag(canvas, pointerEvent(2), ellipseArcRatioDragRef);

    // result
    expect(ellipseArcRatioDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
