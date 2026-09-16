import { RefObject } from 'react';

// types
import { TImageCropRotateDragState } from 'types/design/canvas/types';

// utils
import { armImageCropRotateDrag } from '../armImageCropRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createRef = (): RefObject<TImageCropRotateDragState | null> => ({ current: null });

describe('armImageCropRotateDrag', () => {
  it('should store the pivot, start angle, and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const imageCropRotateDragRef = createRef();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };

    // before — point straight right of the rect's center (20,20) sits at angle 0
    armImageCropRotateDrag(canvas, pointerEvent(5), imageCropRotateDragRef, 'node-a', 0, origin, { x: 40, y: 20 });

    // result
    expect(imageCropRotateDragRef.current).toEqual({
      nodeId: 'node-a',
      origin,
      paintIndex: 0,
      pivot: { x: 20, y: 20 },
      startAngle: 0,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(5);
  });
});
