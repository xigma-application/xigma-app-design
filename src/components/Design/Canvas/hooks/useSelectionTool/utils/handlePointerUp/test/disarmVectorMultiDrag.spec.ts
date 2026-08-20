import { RefObject } from 'react';

// types
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

// utils
import { disarmVectorMultiDrag } from '../disarmVectorMultiDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createVectorMultiDragRef = (vectorMultiDragState: TVectorMultiDragState | null = null): RefObject<TVectorMultiDragState | null> => ({
  current: vectorMultiDragState,
});

describe('disarmVectorMultiDrag', () => {
  it('should do nothing when no multi-drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const setClassName = vi.fn();

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(), createVectorMultiDragRef(), setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the vector-multi-drag ref, release pointer capture, and reset the cursor', () => {
    // mock
    const canvas = createCanvas();
    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: {},
      nodeId: 'path-1',
      pointerStart: { x: 5, y: 5 },
      vertexOrigins: { 'vertex-1': { x: 0, y: 0 } },
    });
    const setClassName = vi.fn();

    // before
    disarmVectorMultiDrag(canvas, pointerEvent(2), vectorMultiDragRef, setClassName);

    // result
    expect(vectorMultiDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
