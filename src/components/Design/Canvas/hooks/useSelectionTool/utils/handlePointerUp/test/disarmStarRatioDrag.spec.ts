import { RefObject } from 'react';

// types
import { TStarRatioDragState } from 'types/design/selectionTool/types';

// utils
import { disarmStarRatioDrag } from '../disarmStarRatioDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createStarRatioDragRef = (dragState: TStarRatioDragState | null = null): RefObject<TStarRatioDragState | null> => ({
  current: dragState,
});

describe('disarmStarRatioDrag', () => {
  it('should do nothing when no star ratio drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmStarRatioDrag(canvas, pointerEvent(), createStarRatioDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the star ratio-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const starRatioDragRef = createStarRatioDragRef({
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: 'node-a',
      points: 5,
      rotation: 0,
    });

    // before
    disarmStarRatioDrag(canvas, pointerEvent(2), starRatioDragRef);

    // result
    expect(starRatioDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
