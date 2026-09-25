// utils
import { disarmSimpleDrag } from '../disarmSimpleDrag';

describe('disarmSimpleDrag', () => {
  it('should end an active drag and release the pointer', () => {
    // mock
    const canvas = { releasePointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
    const dragRef = { current: { id: 'drag' } as { id: string } | null };

    // before
    disarmSimpleDrag(canvas, { pointerId: 4 } as PointerEvent, dragRef);

    // result
    expect(dragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(4);
  });

  it('should do nothing without an active drag', () => {
    // mock
    const canvas = { releasePointerCapture: vi.fn() } as unknown as HTMLCanvasElement;

    // before
    disarmSimpleDrag(canvas, { pointerId: 4 } as PointerEvent, { current: null });

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });
});
