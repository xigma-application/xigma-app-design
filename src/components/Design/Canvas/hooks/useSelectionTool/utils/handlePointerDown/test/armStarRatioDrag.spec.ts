import { RefObject } from 'react';

// types
import { TStarRatioDragState } from 'types/design/selectionTool/types';

// utils
import { armStarRatioDrag } from '../armStarRatioDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createStarRatioDragRef = (): RefObject<TStarRatioDragState | null> => ({ current: null });

describe('armStarRatioDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const starRatioDragRef = createStarRatioDragRef();

    // before
    armStarRatioDrag(canvas, pointerEvent(3), starRatioDragRef, { height: 100, width: 100, x: 0, y: 0 }, 'node-a', 30, 5, true, false);

    // result
    expect(starRatioDragRef.current).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: true,
      flipY: false,
      nodeId: 'node-a',
      points: 5,
      rotation: 30,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
