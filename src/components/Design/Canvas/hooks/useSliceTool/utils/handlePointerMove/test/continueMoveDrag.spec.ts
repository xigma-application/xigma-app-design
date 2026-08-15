import { RefObject } from 'react';

// types
import { TSliceDraft, TSliceMoveDragState } from '../../../types';

// utils
import { continueMoveDrag } from '../continueMoveDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

describe('continueMoveDrag', () => {
  it('should do nothing when no move drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const moveDragRef: RefObject<TSliceMoveDragState | null> = { current: null };

    // before
    continueMoveDrag(canvas, pointerEvent(10, 10), sliceRef, moveDragRef);

    // result
    expect(sliceRef.current).toBeNull();
  });

  it('should translate the box by the pointer delta, leaving size and rotation untouched', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const origin: TSliceDraft = { height: 40, rotation: 20, width: 60, x: 100, y: 100 };
    const moveDragRef: RefObject<TSliceMoveDragState | null> = { current: { origin, pointerStart: { x: 110, y: 110 } } };

    // before
    continueMoveDrag(canvas, pointerEvent(130, 150), sliceRef, moveDragRef);

    // result
    expect(sliceRef.current).toEqual({ height: 40, rotation: 20, width: 60, x: 120, y: 140 });
  });
});
