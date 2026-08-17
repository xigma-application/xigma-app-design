import { RefObject } from 'react';

// types
import { TPolygonCornerRadiusDragState } from '../../../types';

// utils
import { armPolygonCornerRadiusDrag } from '../armPolygonCornerRadiusDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createPolygonCornerRadiusDragRef = (): RefObject<TPolygonCornerRadiusDragState | null> => ({ current: null });

describe('armPolygonCornerRadiusDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const polygonCornerRadiusDragRef = createPolygonCornerRadiusDragRef();

    // before
    armPolygonCornerRadiusDrag(
      canvas,
      pointerEvent(3),
      polygonCornerRadiusDragRef,
      { height: 100, width: 100, x: 0, y: 0 },
      'node-a',
      30,
      3,
      true,
      false,
    );

    // result
    expect(polygonCornerRadiusDragRef.current).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: true,
      flipY: false,
      hasMoved: false,
      nodeId: 'node-a',
      rotation: 30,
      sides: 3,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
