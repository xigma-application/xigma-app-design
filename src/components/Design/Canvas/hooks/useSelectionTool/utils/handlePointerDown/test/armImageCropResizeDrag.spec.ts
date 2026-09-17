import { RefObject } from 'react';

// types
import { TImageCropResizeDragState } from 'types/design/canvas/types';

// utils
import { armImageCropResizeDrag } from '../armImageCropResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createRef = (): RefObject<TImageCropResizeDragState | null> => ({ current: null });

describe('armImageCropResizeDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const imageCropResizeDragRef = createRef();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };

    // before
    armImageCropResizeDrag(canvas, pointerEvent(4), imageCropResizeDragRef, 'node-a', 0, origin, 'se');

    // result
    expect(imageCropResizeDragRef.current).toEqual({ handle: 'se', nodeId: 'node-a', origin, paintIndex: 0 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(4);
  });

  it("should capture the paint's current flipX/flipY as the drag's original values", () => {
    // mock
    const canvas = createCanvas();
    const imageCropResizeDragRef = createRef();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };

    // before
    armImageCropResizeDrag(canvas, pointerEvent(4), imageCropResizeDragRef, 'node-a', 0, origin, 'se', true, false);

    // result
    expect(imageCropResizeDragRef.current).toEqual({
      handle: 'se',
      nodeId: 'node-a',
      origin,
      originalFlipX: true,
      originalFlipY: false,
      paintIndex: 0,
    });
  });
});
