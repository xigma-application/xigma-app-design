// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { disarmVectorLassoDrag } from '../disarmVectorLassoDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

describe('disarmVectorLassoDrag', () => {
  it('should do nothing when no lasso drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    disarmVectorLassoDrag(canvas, pointerEvent(), canvasRefs, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the lasso path, release pointer capture, and reset the cursor', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({
      vectorLassoPathRef: {
        current: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      },
    });
    const setClassName = vi.fn();

    // before
    disarmVectorLassoDrag(canvas, pointerEvent(2), canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorLassoPathRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
