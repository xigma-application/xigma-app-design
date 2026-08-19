import { RefObject } from 'react';

// types
import { TVectorVertexDragState } from 'types/design/selectionTool/types';

// utils
import { disarmVectorVertexDrag } from '../disarmVectorVertexDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createVectorVertexDragRef = (
  vectorVertexDragState: TVectorVertexDragState | null = null,
): RefObject<TVectorVertexDragState | null> => ({
  current: vectorVertexDragState,
});

describe('disarmVectorVertexDrag', () => {
  it('should do nothing when no vector vertex drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(), createVectorVertexDragRef(), setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the vector-vertex-drag ref, release pointer capture, and reset the cursor', () => {
    // mock
    const canvas = createCanvas();
    const vectorVertexDragRef = createVectorVertexDragRef({
      nodeId: 'path-1',
      origins: { 'vertex-1': { x: 0, y: 0 } },
      pointerStart: { x: 5, y: 5 },
    });
    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(2), vectorVertexDragRef, setClassName);

    // result
    expect(vectorVertexDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
