// utils
import { armVertexCountDrag } from '../armVertexCountDrag';

describe('armVertexCountDrag', () => {
  it('should store the shape being edited and capture the pointer', () => {
    // mock
    const canvas = { setPointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
    const dragRef = { current: null };
    const bounds = { height: 10, width: 10, x: 0, y: 0 };

    // before
    armVertexCountDrag(canvas, { pointerId: 9 } as PointerEvent, dragRef, bounds, 'n', 30, true, false);

    // result
    expect(dragRef.current).toEqual({ bounds, flipX: true, flipY: false, nodeId: 'n', rotation: 30 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(9);
  });
});
