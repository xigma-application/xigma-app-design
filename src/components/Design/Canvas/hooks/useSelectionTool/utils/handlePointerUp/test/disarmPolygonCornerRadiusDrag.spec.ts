import { RefObject } from 'react';

// types

// utils
import { disarmPolygonCornerRadiusDrag } from '../disarmPolygonCornerRadiusDrag';
import { TPolygonCornerRadiusDragState } from 'types/design/canvas/types';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createPolygonCornerRadiusDragRef = (
  dragState: TPolygonCornerRadiusDragState | null = null,
): RefObject<TPolygonCornerRadiusDragState | null> => ({ current: dragState });

describe('disarmPolygonCornerRadiusDrag', () => {
  it('should do nothing when no polygon corner-radius drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmPolygonCornerRadiusDrag(canvas, pointerEvent(), createPolygonCornerRadiusDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the polygon corner-radius-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const polygonCornerRadiusDragRef = createPolygonCornerRadiusDragRef({
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      hasMoved: true,
      nodeId: 'node-a',
      rotation: 0,
      sides: 3,
    });

    // before
    disarmPolygonCornerRadiusDrag(canvas, pointerEvent(2), polygonCornerRadiusDragRef);

    // result
    expect(polygonCornerRadiusDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
