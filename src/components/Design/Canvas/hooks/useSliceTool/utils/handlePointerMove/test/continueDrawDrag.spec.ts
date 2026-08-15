import { RefObject } from 'react';

// types
import { TSliceDraft, TSliceDrawDragState } from '../../../types';

// utils
import { continueDrawDrag } from '../continueDrawDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

describe('continueDrawDrag', () => {
  it('should do nothing when no draw drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: null };

    // before
    continueDrawDrag(canvas, pointerEvent(10, 10), sliceRef, drawDragRef);

    // result
    expect(sliceRef.current).toBeNull();
  });

  it('should write the live draft rect at rotation 0', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: { start: { x: 10, y: 10 } } };

    // before
    continueDrawDrag(canvas, pointerEvent(60, 90), sliceRef, drawDragRef);

    // result
    expect(sliceRef.current).toEqual({ height: 80, rotation: 0, width: 50, x: 10, y: 10 });
  });
});
