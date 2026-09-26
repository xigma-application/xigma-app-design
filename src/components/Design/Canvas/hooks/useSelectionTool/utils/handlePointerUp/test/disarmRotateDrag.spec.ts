import { RefObject } from 'react';

// types
import { TRotateDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { disarmRotateDrag } from '../disarmRotateDrag';
import { getRotateOriginalFills } from '../../handlePointerMove/continueRotateDrag/rotateOriginalFillsCache';

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

  it('should clear the rotate-original-fills cache for every rotated node id, so the next drag starts fresh instead of rotating from a stale origin', () => {
    // mock — seed the cache as if a rotate drag had already rotated this node's fills once
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { 'rect-1': { height: 10, rotation: 0, width: 10, x: 0, y: 0 } },
      pivot: { x: 5, y: 5 },
      startAngle: 0,
    });
    const originalFills = [{ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill' as const, type: 'image' as const }];

    getRotateOriginalFills('rect-1', originalFills);

    // before
    disarmRotateDrag(canvas, pointerEvent(), vi.fn(), rotateDragRef, createCanvasRefs());

    // result — a fresh drag on the same id now seeds from whatever is passed in, not the stale value
    const freshFills = [{ opacity: 100, ref: 'asset-2', rotation: 0, scaleMode: 'fit' as const, type: 'image' as const }];

    expect(getRotateOriginalFills('rect-1', freshFills)).toBe(freshFills);
  });

  it('should commit the snapshotted vector node’s final rotation, computed from its frozen origin and the snapshot’s final delta', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { 'vector-1': { bakesRotation: false, fillRotation: 0, rotation: 0, segments: {}, vertices: {} } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });

    canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([
      ['vector-1', { deltaDegrees: 90, facesByPaint: [], pivot: { x: 50, y: 50 }, strokeVertices: [], strokes: [{ color: '#000000', opacity: 100, type: 'solid' as const }] }],
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
      ['vector-1', { deltaDegrees: 90, facesByPaint: [], pivot: { x: 50, y: 50 }, strokeVertices: [], strokes: [{ color: '#000000', opacity: 100, type: 'solid' as const }] }],
    ]);

    const dispatch = vi.fn();

    // before
    disarmRotateDrag(canvas, pointerEvent(), dispatch, rotateDragRef, canvasRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current).toBeNull();
  });
});
