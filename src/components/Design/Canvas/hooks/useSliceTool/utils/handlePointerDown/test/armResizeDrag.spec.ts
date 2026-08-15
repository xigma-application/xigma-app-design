import { RefObject } from 'react';

// types
import { TSliceDraft, TSliceResizeDragState } from '../../../types';

// utils
import { armResizeDrag } from '../armResizeDrag';

const createCanvasMock = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn() }) as unknown as HTMLCanvasElement;

describe('armResizeDrag', () => {
  it('should record the resize bounds and handle, and capture the pointer', () => {
    // mock
    const canvas = createCanvasMock();
    const event = { pointerId: 5 } as PointerEvent;
    const resizeDragRef: RefObject<TSliceResizeDragState | null> = { current: null };
    const bounds: TSliceDraft = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    armResizeDrag(canvas, event, resizeDragRef, bounds, 'se');

    // result
    expect(resizeDragRef.current).toEqual({ bounds, handle: 'se' });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(5);
  });
});
