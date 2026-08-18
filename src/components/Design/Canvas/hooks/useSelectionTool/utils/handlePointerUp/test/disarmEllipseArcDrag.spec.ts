import { RefObject } from 'react';

// types
import { TEllipseArcDragState } from 'types/design/canvas/types';

// utils
import { disarmEllipseArcDrag } from '../disarmEllipseArcDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createEllipseArcDragRef = (dragState: TEllipseArcDragState | null = null): RefObject<TEllipseArcDragState | null> => ({
  current: dragState,
});

describe('disarmEllipseArcDrag', () => {
  it('should do nothing when no ellipse-arc drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmEllipseArcDrag(canvas, pointerEvent(), createEllipseArcDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the ellipse-arc-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const ellipseArcDragRef = createEllipseArcDragRef({
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: 'node-a',
      rotation: 0,
    });

    // before
    disarmEllipseArcDrag(canvas, pointerEvent(2), ellipseArcDragRef);

    // result
    expect(ellipseArcDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
