// utils
import { armProgressiveBlurDrag } from '../armProgressiveBlurDrag';

describe('armProgressiveBlurDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = { setPointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
    const dragRef = { current: null };
    const dragState = { effectIndex: 1, endpoint: 'end' as const, nodeId: 'n1' };

    // action
    armProgressiveBlurDrag(canvas, { pointerId: 7 } as PointerEvent, dragRef, dragState);

    // result
    expect(dragRef.current).toEqual(dragState);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(7);
  });
});
