import { RefObject } from 'react';

// types
import { TSliceDraft, TSliceRotateDragState } from '../../../types';

// utils
import { continueRotateDrag } from '../continueRotateDrag';
import { getRotatedRotateCursorUrl } from 'utils/canvas/getRotatedRotateCursorUrl';

vi.mock('utils/canvas/getRotatedRotateCursorUrl', () => ({ getRotatedRotateCursorUrl: vi.fn() }));

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

describe('continueRotateDrag', () => {
  it('should do nothing when no rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = { current: null };

    // before
    continueRotateDrag(canvas, pointerEvent(10, 10), sliceRef, rotateDragRef);

    // result
    expect(sliceRef.current).toBeNull();
  });

  it('should spin the box in place around its own center, position derived from the new angle', () => {
    // mock — pivot equals the box's own center (50, 50); pointer starts due east (angle 0)
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const origin: TSliceDraft = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = {
      current: { cursorAngle: 0, origin, pivot: { x: 50, y: 50 }, startAngle: 0 },
    };

    // before — pointer moves due south of the pivot (angle 90), a 90deg delta
    continueRotateDrag(canvas, pointerEvent(50, 150), sliceRef, rotateDragRef);

    // result — position collapses back to the same x/y, only rotation changes
    expect(sliceRef.current).toEqual({ height: 100, rotation: 90, width: 100, x: 0, y: 0 });
  });

  it('should accumulate on top of a box that already had a non-zero rotation', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const origin: TSliceDraft = { height: 100, rotation: 30, width: 100, x: 0, y: 0 };
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = {
      current: { cursorAngle: 0, origin, pivot: { x: 50, y: 50 }, startAngle: 0 },
    };

    // before
    continueRotateDrag(canvas, pointerEvent(50, 150), sliceRef, rotateDragRef);

    // result
    expect(sliceRef.current).toMatchObject({ rotation: 120 });
  });

  it('should update the canvas cursor to follow the rotation when a rotated cursor image is available', () => {
    // mock
    vi.mocked(getRotatedRotateCursorUrl).mockReturnValue('url(rotate.png), auto');

    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const origin: TSliceDraft = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = {
      current: { cursorAngle: 0, origin, pivot: { x: 50, y: 50 }, startAngle: 0 },
    };

    // before
    continueRotateDrag(canvas, pointerEvent(50, 150), sliceRef, rotateDragRef);

    // result
    expect(canvas.style.cursor).toBe('url(rotate.png), auto');
  });

  it('should keep the previous cursor when no rotated cursor image is available yet', () => {
    // mock
    vi.mocked(getRotatedRotateCursorUrl).mockReturnValue(null);

    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const origin: TSliceDraft = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };
    const rotateDragRef: RefObject<TSliceRotateDragState | null> = {
      current: { cursorAngle: 0, origin, pivot: { x: 50, y: 50 }, startAngle: 0 },
    };

    canvas.style.cursor = 'wait';

    // before
    continueRotateDrag(canvas, pointerEvent(50, 150), sliceRef, rotateDragRef);

    // result
    expect(canvas.style.cursor).toBe('wait');
  });
});
