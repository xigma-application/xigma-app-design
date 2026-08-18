import { RefObject } from 'react';

// types

// utils
import { armEllipseArcDrag } from '../armEllipseArcDrag';
import { TEllipseArcDragState } from 'types/design/canvas/types';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createEllipseArcDragRef = (): RefObject<TEllipseArcDragState | null> => ({ current: null });

describe('armEllipseArcDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const ellipseArcDragRef = createEllipseArcDragRef();

    // before
    armEllipseArcDrag(canvas, pointerEvent(3), ellipseArcDragRef, { height: 100, width: 100, x: 0, y: 0 }, 'node-a', 30, true, false);

    // result
    expect(ellipseArcDragRef.current).toEqual({
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
