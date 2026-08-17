import { RefObject } from 'react';

// types
import { TStarVertexCountDragState } from '../../../types';

// utils
import { disarmStarVertexCountDrag } from '../disarmStarVertexCountDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createStarVertexCountDragRef = (dragState: TStarVertexCountDragState | null = null): RefObject<TStarVertexCountDragState | null> => ({
  current: dragState,
});

describe('disarmStarVertexCountDrag', () => {
  it('should do nothing when no star vertex-count drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmStarVertexCountDrag(canvas, pointerEvent(), createStarVertexCountDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the star vertex-count-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const starVertexCountDragRef = createStarVertexCountDragRef({
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: 'node-a',
      rotation: 0,
    });

    // before
    disarmStarVertexCountDrag(canvas, pointerEvent(2), starVertexCountDragRef);

    // result
    expect(starVertexCountDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
