import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { TPoint } from 'types/canvas';

// utils
import { armMarqueeDrag } from '../armMarqueeDrag';

const createCanvasMock = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn() }) as unknown as HTMLCanvasElement;

describe('armMarqueeDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection(['a']));
  });

  it('should clear the current selection, record the marquee start point, and capture the pointer', () => {
    // mock
    const canvas = createCanvasMock();
    const event = { pointerId: 7 } as PointerEvent;
    const marqueeStartRef: RefObject<TPoint | null> = { current: null };

    // before
    armMarqueeDrag(canvas, event, store.dispatch, marqueeStartRef, { x: 15, y: 25 });

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(marqueeStartRef.current).toEqual({ x: 15, y: 25 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(7);
  });
});
