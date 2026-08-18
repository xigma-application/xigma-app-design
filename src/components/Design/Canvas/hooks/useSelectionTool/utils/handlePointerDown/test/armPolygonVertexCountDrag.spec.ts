import { RefObject } from 'react';

// types
import { TPolygonVertexCountDragState } from 'types/design/selectionTool/types';

// utils
import { armPolygonVertexCountDrag } from '../armPolygonVertexCountDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createPolygonVertexCountDragRef = (): RefObject<TPolygonVertexCountDragState | null> => ({ current: null });

describe('armPolygonVertexCountDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const polygonVertexCountDragRef = createPolygonVertexCountDragRef();

    // before
    armPolygonVertexCountDrag(
      canvas,
      pointerEvent(3),
      polygonVertexCountDragRef,
      { height: 100, width: 100, x: 0, y: 0 },
      'node-a',
      30,
      true,
      false,
    );

    // result
    expect(polygonVertexCountDragRef.current).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: true,
      flipY: false,
      nodeId: 'node-a',
      rotation: 30,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
