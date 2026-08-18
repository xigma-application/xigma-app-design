import { RefObject } from 'react';

// others
import { DEFAULT_SHAPE_SIZE } from '../../../../../constants';

// types
import { TSliceDrawDragState } from '../../../types';
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { DEFAULT_CURSOR } from 'utils/canvas/defaultCursor';
import { disarmDrawDrag } from '../disarmDrawDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, pointerId = 1): PointerEvent =>
  new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId });

describe('disarmDrawDrag', () => {
  it('should do nothing when no draw drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: null };

    // before
    disarmDrawDrag(canvas, pointerEvent(0, 0), sliceRef, drawDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should keep the actual dragged rect and show the default cursor when the drag was large enough', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: { start: { x: 0, y: 0 } } };

    // before
    disarmDrawDrag(canvas, pointerEvent(20, 20, 3), sliceRef, drawDragRef);

    // result
    expect(sliceRef.current).toEqual({ height: 20, rotation: 0, width: 20, x: 0, y: 0 });
    expect(canvas.style.cursor).toBe(DEFAULT_CURSOR);
    expect(drawDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(3);
  });

  it('should place a default 100x100 slice centered on the click point when released without dragging', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: { start: { x: 50, y: 50 } } };

    // before
    disarmDrawDrag(canvas, pointerEvent(50, 50, 4), sliceRef, drawDragRef);

    // result
    expect(sliceRef.current).toEqual({ height: DEFAULT_SHAPE_SIZE, rotation: 0, width: DEFAULT_SHAPE_SIZE, x: 0, y: 0 });
    expect(canvas.style.cursor).toBe(DEFAULT_CURSOR);
  });
});
