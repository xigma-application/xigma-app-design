import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorMultiDrag } from '../armVectorMultiDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createVectorMultiDragRef = (): RefObject<TVectorMultiDragState | null> => ({ current: null });

const vector: TVectorNode = {
  fillColor: '#000000',
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 5 }, v3: { id: 'v3', x: 20, y: 10 } },
};

describe('armVectorMultiDrag', () => {
  it('should snapshot every selected vertex origin, every selected handle origin, and the pointer start, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const vectorMultiDragRef = createVectorMultiDragRef();

    // before
    armVectorMultiDrag(
      canvas,
      pointerEvent(3),
      vectorMultiDragRef,
      vector,
      ['v1', 'v3'],
      [
        { end: 'start', segmentId: 's1' },
        { end: 'end', segmentId: 's1' },
      ],
      { x: 8, y: 9 },
    );

    // result
    expect(vectorMultiDragRef.current).toEqual({
      handleOrigins: { 'end:s1': { x: -5, y: 0 }, 'start:s1': { x: 5, y: 0 } },
      hasMoved: false,
      nodeId: 'vector-1',
      pendingClickAction: null,
      pointerStart: { x: 8, y: 9 },
      vertexOrigins: { v1: { x: 0, y: 0 }, v3: { x: 20, y: 10 } },
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should skip a handle whose end has no resolvable tangent', () => {
    // mock — s2's end (v3) has no tangentEnd at all
    const canvas = createCanvas();
    const vectorMultiDragRef = createVectorMultiDragRef();

    // before
    armVectorMultiDrag(canvas, pointerEvent(), vectorMultiDragRef, vector, [], [{ end: 'end', segmentId: 's2' }], { x: 0, y: 0 });

    // result
    expect(vectorMultiDragRef.current?.handleOrigins).toEqual({});
  });

  it('should default the pending click action to null when none is given, and store one when given', () => {
    // mock
    const canvas = createCanvas();
    const vectorMultiDragRef = createVectorMultiDragRef();

    // before
    armVectorMultiDrag(canvas, pointerEvent(), vectorMultiDragRef, vector, ['v1'], [], { x: 0, y: 0 }, { id: 'v1', kind: 'vertex' });

    // result
    expect(vectorMultiDragRef.current?.pendingClickAction).toEqual({ id: 'v1', kind: 'vertex' });
    expect(vectorMultiDragRef.current?.hasMoved).toBe(false);
  });
});
