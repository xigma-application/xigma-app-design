import { RefObject } from 'react';

// types
import { TSliceDrawDragState } from '../../../types';

// utils
import { armDrawDrag } from '../armDrawDrag';

const createCanvasMock = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn() }) as unknown as HTMLCanvasElement;

describe('armDrawDrag', () => {
  it('should record the draw start point and capture the pointer', () => {
    // mock
    const canvas = createCanvasMock();
    const event = { pointerId: 4 } as PointerEvent;
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: null };

    // before
    armDrawDrag(canvas, event, drawDragRef, { x: 10, y: 20 });

    // result
    expect(drawDragRef.current).toEqual({ start: { x: 10, y: 20 } });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(4);
  });
});
