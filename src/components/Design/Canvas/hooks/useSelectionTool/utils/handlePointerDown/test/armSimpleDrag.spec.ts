// utils
import { armSimpleDrag } from '../armSimpleDrag';

describe('armSimpleDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = { setPointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
    const dragRef = { current: null as { id: string } | null };

    // before
    armSimpleDrag(canvas, { pointerId: 9 } as PointerEvent, dragRef, { id: 'state' });

    // result
    expect(dragRef.current).toEqual({ id: 'state' });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(9);
  });
});
