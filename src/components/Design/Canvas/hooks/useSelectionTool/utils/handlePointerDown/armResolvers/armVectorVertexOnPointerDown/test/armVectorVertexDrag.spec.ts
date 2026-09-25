// types
import { TVectorNode } from 'types/design/types';
import { TVectorVertexDragState } from 'types/design/selectionTool/types';

// utils
import { armVectorVertexDrag } from '../armVectorVertexDrag';

describe('armVectorVertexDrag', () => {
  it('should remember where the vertex started and capture the pointer', () => {
    // mock
    const canvas = { setPointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
    const ref = { current: null as TVectorVertexDragState | null };
    const node = { id: 'v', vertices: { a: { id: 'a', x: 3, y: 4 } } } as unknown as TVectorNode;

    // before
    armVectorVertexDrag(canvas, { pointerId: 5 } as PointerEvent, ref, node, 'a', { x: 1, y: 2 });

    // result
    expect(ref.current).toEqual({
      dispatchThrottle: { frameId: null, run: null },
      nodeId: 'v',
      origins: { a: { x: 3, y: 4 } },
      pointerStart: { x: 1, y: 2 },
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(5);
  });
});
