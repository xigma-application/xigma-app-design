// types
import { TVectorEraseDragState } from 'types/design/selectionTool/types';

// utils
import { disarmVectorEraseDrag } from '../disarmVectorEraseDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerUp = (): PointerEvent => new PointerEvent('pointerup', { pointerId: 1 });

describe('disarmVectorEraseDrag', () => {
  it('should do nothing when no erase drag is armed', () => {
    // mock
    const canvas = createCanvas();
    const setClassName = vi.fn();

    // action
    disarmVectorEraseDrag(canvas, pointerUp(), { current: null }, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should release the pointer, clear the drag ref and keep the erase cursor (the tool stays selected)', () => {
    // mock
    const canvas = createCanvas();
    const setClassName = vi.fn();
    const dragRef: { current: TVectorEraseDragState | null } = { current: { lastPoint: { x: 1, y: 2 } } };

    // action
    disarmVectorEraseDrag(canvas, pointerUp(), dragRef, setClassName);

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(dragRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('erase');
  });
});
