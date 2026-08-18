import { RefObject } from 'react';

// types
import { TStarVertexCountDragState } from 'types/design/selectionTool/types';

// utils
import { armStarVertexCountDrag } from '../armStarVertexCountDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createStarVertexCountDragRef = (): RefObject<TStarVertexCountDragState | null> => ({ current: null });

describe('armStarVertexCountDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const starVertexCountDragRef = createStarVertexCountDragRef();

    // before
    armStarVertexCountDrag(
      canvas,
      pointerEvent(3),
      starVertexCountDragRef,
      { height: 100, width: 100, x: 0, y: 0 },
      'node-a',
      30,
      true,
      false,
    );

    // result
    expect(starVertexCountDragRef.current).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: true,
      flipY: false,
      nodeId: 'node-a',
      rotation: 30,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
