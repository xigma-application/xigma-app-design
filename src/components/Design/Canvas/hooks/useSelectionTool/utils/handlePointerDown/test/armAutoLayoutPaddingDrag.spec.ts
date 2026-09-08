import { RefObject } from 'react';

// types
import { TAutoLayoutPaddingDragState } from 'types/design/canvas/types';

// utils
import { armAutoLayoutPaddingDrag } from '../armAutoLayoutPaddingDrag';

describe('armAutoLayoutPaddingDrag', () => {
  it('should arm an absolute-mode drag when the original padding value is 0', () => {
    // mock
    const canvas = { setPointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
    const event = { pointerId: 3 } as PointerEvent;
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: null };
    const point = { x: 10, y: 20 };

    // before
    armAutoLayoutPaddingDrag(canvas, event, paddingDragRef, 'left', 'frame-1', 0, point);

    // result
    expect(paddingDragRef.current).toEqual({
      frameId: 'frame-1',
      hasMoved: false,
      mode: 'absolute',
      originalPaddingValue: 0,
      point,
      pointerStart: point,
      side: 'left',
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should arm a delta-mode drag when the original padding value is positive', () => {
    // mock
    const canvas = { setPointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
    const event = { pointerId: 4 } as PointerEvent;
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: null };
    const point = { x: 5, y: 15 };

    // before
    armAutoLayoutPaddingDrag(canvas, event, paddingDragRef, 'top', 'frame-1', 40, point);

    // result
    expect(paddingDragRef.current).toEqual({
      frameId: 'frame-1',
      hasMoved: false,
      mode: 'delta',
      originalPaddingValue: 40,
      point,
      pointerStart: point,
      side: 'top',
    });
  });
});
