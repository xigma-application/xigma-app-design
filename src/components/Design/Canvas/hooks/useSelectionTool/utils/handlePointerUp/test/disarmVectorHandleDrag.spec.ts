import { RefObject } from 'react';

// types
import { TVectorHandleDragState } from 'types/design/selectionTool/types';

// utils
import { disarmVectorHandleDrag } from '../disarmVectorHandleDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createVectorHandleDragRef = (
  vectorHandleDragState: TVectorHandleDragState | null = null,
): RefObject<TVectorHandleDragState | null> => ({
  current: vectorHandleDragState,
});

describe('disarmVectorHandleDrag', () => {
  it('should do nothing when no vector handle drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const setClassName = vi.fn();

    // before
    disarmVectorHandleDrag(canvas, pointerEvent(), createVectorHandleDragRef(), setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the vector-handle-drag ref, release pointer capture, and reset the cursor', () => {
    // mock
    const canvas = createCanvas();
    const vectorHandleDragRef = createVectorHandleDragRef({
      end: 'end',
      nodeId: 'path-1',
      segmentId: 'segment-1',
      vertexId: 'vertex-1',
    });
    const setClassName = vi.fn();

    // before
    disarmVectorHandleDrag(canvas, pointerEvent(2), vectorHandleDragRef, setClassName);

    // result
    expect(vectorHandleDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
