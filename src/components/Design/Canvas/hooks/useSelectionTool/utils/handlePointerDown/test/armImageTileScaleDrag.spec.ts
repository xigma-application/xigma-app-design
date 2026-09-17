import { RefObject } from 'react';

// types
import { TImageTileScaleDragState } from 'types/design/canvas/types';

// utils
import { armImageTileScaleDrag } from '../armImageTileScaleDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createRef = (): RefObject<TImageTileScaleDragState | null> => ({ current: null });

describe('armImageTileScaleDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const imageTileScaleDragRef = createRef();

    // before
    armImageTileScaleDrag(canvas, pointerEvent(3), imageTileScaleDragRef, 'node-a', 0, { x: 0, y: 0 }, 50, 0.5);

    // result
    expect(imageTileScaleDragRef.current).toEqual({
      anchor: { x: 0, y: 0 },
      nodeId: 'node-a',
      paintIndex: 0,
      startDistance: 50,
      startScale: 0.5,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
