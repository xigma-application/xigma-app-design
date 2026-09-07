import { RefObject } from 'react';

// types
import { TAutoLayoutGapDragState } from 'types/design/canvas/types';

// utils
import { armAutoLayoutGapDrag } from '../armAutoLayoutGapDrag';

describe('armAutoLayoutGapDrag', () => {
  it('should store the drag state and capture the pointer', () => {
    // mock
    const canvas = { setPointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
    const event = { pointerId: 3 } as PointerEvent;
    const gapDragRef: RefObject<TAutoLayoutGapDragState | null> = { current: null };
    const point = { x: 10, y: 20 };

    // before
    armAutoLayoutGapDrag(canvas, event, gapDragRef, 'horizontal', 'frame-1', 40, point);

    // result
    expect(gapDragRef.current).toEqual({ axis: 'horizontal', frameId: 'frame-1', originalGapValue: 40, point, pointerStart: point });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
