// utils
import { handlePointerUp } from '../handlePointerUp';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (): PointerEvent => new PointerEvent('pointerup', { pointerId: 1 });

describe('handlePointerUp', () => {
  it('should do nothing when no drag was in progress', () => {
    // mock
    const canvas = createCanvas();
    const lastPointRef = { current: null };
    const setClassName = vi.fn();

    // before
    handlePointerUp(canvas, pointerEvent(), lastPointRef, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the last point, release the pointer, and switch back to the hand cursor', () => {
    // mock
    const canvas = createCanvas();
    const lastPointRef = { current: { x: 10, y: 10 } };
    const setClassName = vi.fn();

    // before
    handlePointerUp(canvas, pointerEvent(), lastPointRef, setClassName);

    // result
    expect(lastPointRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(setClassName).toHaveBeenCalledWith('hand');
  });
});
