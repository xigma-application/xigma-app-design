import { RefObject } from 'react';

// types
import { TPolygonVertexCountDragState } from '../../../types';

// utils
import { disarmPolygonVertexCountDrag } from '../disarmPolygonVertexCountDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createPolygonVertexCountDragRef = (
  dragState: TPolygonVertexCountDragState | null = null,
): RefObject<TPolygonVertexCountDragState | null> => ({ current: dragState });

describe('disarmPolygonVertexCountDrag', () => {
  it('should do nothing when no polygon vertex-count drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmPolygonVertexCountDrag(canvas, pointerEvent(), createPolygonVertexCountDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the polygon vertex-count-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const polygonVertexCountDragRef = createPolygonVertexCountDragRef({
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: 'node-a',
      rotation: 0,
    });

    // before
    disarmPolygonVertexCountDrag(canvas, pointerEvent(2), polygonVertexCountDragRef);

    // result
    expect(polygonVertexCountDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
