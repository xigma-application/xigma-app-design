import { RefObject } from 'react';

// types
import { TImageCropMoveDragState } from 'types/design/canvas/types';

// utils
import { armImageCropMoveDrag } from '../armImageCropMoveDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createRef = (): RefObject<TImageCropMoveDragState | null> => ({ current: null });

describe('armImageCropMoveDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const imageCropMoveDragRef = createRef();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };

    // before
    armImageCropMoveDrag(canvas, pointerEvent(3), imageCropMoveDragRef, 'node-a', 0, origin, { x: 5, y: 5 });

    // result
    expect(imageCropMoveDragRef.current).toEqual({ nodeId: 'node-a', origin, paintIndex: 0, startPoint: { x: 5, y: 5 } });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
