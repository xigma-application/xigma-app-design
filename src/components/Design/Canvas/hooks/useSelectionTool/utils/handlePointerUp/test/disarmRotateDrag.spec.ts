import { RefObject } from 'react';

// types
import { TRotateDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { disarmRotateDrag } from '../disarmRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createRotateDragRef = (rotateDragState: TRotateDragState | null = null): RefObject<TRotateDragState | null> => ({
  current: rotateDragState,
});

describe('disarmRotateDrag', () => {
  it('should do nothing when no rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmRotateDrag(canvas, pointerEvent(), vi.fn(), createRotateDragRef(), createCanvasRefs());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the rotate-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: {},
      pivot: { x: 0, y: 0 },
      startAngle: 0,
    });

    // before
    disarmRotateDrag(canvas, pointerEvent(2), vi.fn(), rotateDragRef, createCanvasRefs());

    // result
    expect(rotateDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should commit the snapshotted vector node’s final rotation, computed from its frozen origin and the snapshot’s final delta', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { 'vector-1': { rotation: 0, segments: {}, vertices: {} } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });

    canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([
      ['vector-1', { deltaDegrees: 90, facesByColor: [], pivot: { x: 50, y: 50 }, strokeColor: '#000000', strokeVertices: [] }],
    ]);

    const dispatch = vi.fn();

    // before
    disarmRotateDrag(canvas, pointerEvent(), dispatch, rotateDragRef, canvasRefs);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current).toBeNull();
    expect(canvasRefs.transform.rotatedNodeIdsRef.current).toBeNull();
  });

  it('should skip a snapshotted node whose origin was never captured, without dispatching or throwing', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: {},
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });

    canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([
      ['vector-1', { deltaDegrees: 90, facesByColor: [], pivot: { x: 50, y: 50 }, strokeColor: '#000000', strokeVertices: [] }],
    ]);

    const dispatch = vi.fn();

    // before
    disarmRotateDrag(canvas, pointerEvent(), dispatch, rotateDragRef, canvasRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current).toBeNull();
  });
});
