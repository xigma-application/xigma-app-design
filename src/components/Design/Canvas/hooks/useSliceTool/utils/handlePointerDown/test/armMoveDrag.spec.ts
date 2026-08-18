import { RefObject } from 'react';

// types
import { TSliceMoveDragState } from '../../../types';
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { armMoveDrag } from '../armMoveDrag';

const createCanvasMock = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn() }) as unknown as HTMLCanvasElement;

describe('armMoveDrag', () => {
  it('should record the origin and pointer start, and capture the pointer', () => {
    // mock
    const canvas = createCanvasMock();
    const event = { pointerId: 8 } as PointerEvent;
    const moveDragRef: RefObject<TSliceMoveDragState | null> = { current: null };
    const origin: TSliceDraft = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    armMoveDrag(canvas, event, moveDragRef, origin, { x: 20, y: 30 });

    // result
    expect(moveDragRef.current).toEqual({ origin, pointerStart: { x: 20, y: 30 } });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(8);
  });
});
