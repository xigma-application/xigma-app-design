import { RefObject } from 'react';

// types
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

// utils
import { disarmVectorSegmentBendDrag } from '../disarmVectorSegmentBendDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createVectorSegmentBendDragRef = (
  value: TVectorSegmentBendDragState | null = null,
): RefObject<TVectorSegmentBendDragState | null> => ({ current: value });

describe('disarmVectorSegmentBendDrag', () => {
  it('should do nothing when no bend drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const setClassName = vi.fn();

    // before
    disarmVectorSegmentBendDrag(canvas, pointerEvent(), createVectorSegmentBendDragRef(), setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the bend-drag ref, release pointer capture, and reset the cursor, leaving whatever bend was already dispatched in place', () => {
    // mock
    const canvas = createCanvas();
    const vectorSegmentBendDragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId: 'path-1',
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    });
    const setClassName = vi.fn();

    // before
    disarmVectorSegmentBendDrag(canvas, pointerEvent(2), vectorSegmentBendDragRef, setClassName);

    // result
    expect(vectorSegmentBendDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
