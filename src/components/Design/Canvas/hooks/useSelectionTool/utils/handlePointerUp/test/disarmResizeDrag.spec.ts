import { RefObject } from 'react';

// types
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { disarmResizeDrag } from '../disarmResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createResizeDragRef = (resizeDragState: TResizeDragState | null = null): RefObject<TResizeDragState | null> => ({
  current: resizeDragState,
});

describe('disarmResizeDrag', () => {
  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmResizeDrag(canvas, pointerEvent(), vi.fn(), createResizeDragRef(), createCanvasRefs());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the resize-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: {},
    });

    // before
    disarmResizeDrag(canvas, pointerEvent(2), vi.fn(), resizeDragRef, createCanvasRefs());

    // result
    expect(resizeDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should commit every resize-snapshotted vector node’s final geometry, computed from its frozen origin and the snapshot’s final scale/anchor', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: {
        'vector-1': {
          rotation: 0,
          segments: {},
          vertices: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 0 } },
        },
      },
    });

    canvasRefs.resizedVectorNodeSnapshotsRef.current = new Map([
      [
        'vector-1',
        {
          anchorX: 0,
          anchorY: 0,
          facesByColor: [],
          flattenedSegments: [],
          scaleX: 2,
          scaleY: 1,
          strokeColor: '#000000',
          strokeWidth: 1,
        },
      ],
    ]);

    const dispatch = vi.fn();

    // before
    disarmResizeDrag(canvas, pointerEvent(), dispatch, resizeDragRef, canvasRefs);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(canvasRefs.resizedVectorNodeSnapshotsRef.current).toBeNull();
    expect(canvasRefs.resizedNodeIdsRef.current).toBeNull();
  });

  it('should skip a snapshotted node whose origin was never captured, without dispatching or throwing', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: {},
    });

    canvasRefs.resizedVectorNodeSnapshotsRef.current = new Map([
      [
        'vector-1',
        {
          anchorX: 0,
          anchorY: 0,
          facesByColor: [],
          flattenedSegments: [],
          scaleX: 2,
          scaleY: 1,
          strokeColor: '#000000',
          strokeWidth: 1,
        },
      ],
    ]);

    const dispatch = vi.fn();

    // before
    disarmResizeDrag(canvas, pointerEvent(), dispatch, resizeDragRef, canvasRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(canvasRefs.resizedVectorNodeSnapshotsRef.current).toBeNull();
  });
});
