import { RefObject } from 'react';

// types
import { TSliceResizeDragState } from '../../../types';
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { continueResizeDrag } from '../continueResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

describe('continueResizeDrag', () => {
  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const resizeDragRef: RefObject<TSliceResizeDragState | null> = { current: null };

    // before
    continueResizeDrag(canvas, pointerEvent(10, 10), sliceRef, resizeDragRef);

    // result
    expect(sliceRef.current).toBeNull();
  });

  it('should resize an unrotated box by dragging its "se" corner', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const resizeDragRef: RefObject<TSliceResizeDragState | null> = {
      current: { bounds: { height: 100, rotation: 0, width: 100, x: 0, y: 0 }, handle: 'se' },
    };

    // before
    continueResizeDrag(canvas, pointerEvent(150, 120), sliceRef, resizeDragRef);

    // result
    expect(sliceRef.current).toEqual({ height: 120, rotation: 0, width: 150, x: 0, y: 0 });
  });

  it('should resize a rotated box along its own local axes, keeping the opposite corner anchored', () => {
    // mock - a 90deg-rotated 100x100 box centered at (50, 50); dragging its "nw" handle to world
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const resizeDragRef: RefObject<TSliceResizeDragState | null> = {
      current: { bounds: { height: 100, rotation: 90, width: 100, x: 0, y: 0 }, handle: 'nw' },
    };

    // before
    continueResizeDrag(canvas, pointerEvent(120, -20), sliceRef, resizeDragRef);

    // result
    const result = sliceRef.current!;

    expect(result.rotation).toBe(90);
    expect(result.width).toBeCloseTo(120);
    expect(result.height).toBeCloseTo(120);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(-20);
  });
});
