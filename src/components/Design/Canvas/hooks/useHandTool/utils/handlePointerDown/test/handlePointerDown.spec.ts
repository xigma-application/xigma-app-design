// utils
import { handlePointerDown } from '../handlePointerDown';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

describe('handlePointerDown', () => {
  it('should ignore a non-primary button press entirely', () => {
    // mock
    const canvas = createCanvas();
    const lastPointRef = { current: null };
    const setClassName = vi.fn();

    // before
    handlePointerDown(canvas, pointerEvent(10, 10, { button: 1 }), lastPointRef, setClassName);

    // result
    expect(lastPointRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should snapshot the pointer-down point, capture the pointer, and switch to the pressing cursor', () => {
    // mock
    const canvas = createCanvas();
    const lastPointRef = { current: null };
    const setClassName = vi.fn();

    // before
    handlePointerDown(canvas, pointerEvent(50, 60), lastPointRef, setClassName);

    // result
    expect(lastPointRef.current).toEqual({ x: 50, y: 60 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(setClassName).toHaveBeenCalledWith('pressing');
  });
});
