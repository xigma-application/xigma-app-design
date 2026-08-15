import { RefObject } from 'react';

// types
import { TSliceDraft, TSliceRotateDragState } from '../../../types';

// utils
import { armRotateDrag } from '../armRotateDrag';

const createCanvasMock = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn() }) as unknown as HTMLCanvasElement;

describe('armRotateDrag', () => {
  it('should record the pivot, cursor angle and start angle, and capture the pointer', () => {
    // mock — pointer sits due east of the slice's center (50, 50), at angle 0
    const canvas = createCanvasMock();
    const event = { pointerId: 6 } as PointerEvent;
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = { current: null };
    const origin: TSliceDraft = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    armRotateDrag(canvas, event, rotateDragRef, origin, { x: 150, y: 50 });

    // result
    expect(rotateDragRef.current).toEqual({ cursorAngle: 90, origin, pivot: { x: 50, y: 50 }, startAngle: 0 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(6);
  });
});
