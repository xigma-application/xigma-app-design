import { RefObject } from 'react';

// types
import { TVectorHandleDragState } from 'types/design/selectionTool/types';
import { TVectorHandleHit } from '../../../../utils/getVectorHandleAtPoint';

// utils
import { armVectorHandleDrag } from '../armVectorHandleDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createVectorHandleDragRef = (): RefObject<TVectorHandleDragState | null> => ({ current: null });

describe('armVectorHandleDrag', () => {
  it('should record the node id and the hit handle, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const vectorHandleDragRef = createVectorHandleDragRef();
    const hit: TVectorHandleHit = { end: 'start', segmentId: 's1', vertexId: 'v1' };

    // before
    armVectorHandleDrag(canvas, pointerEvent(4), vectorHandleDragRef, 'vector-1', hit);

    // result
    expect(vectorHandleDragRef.current).toEqual({ end: 'start', nodeId: 'vector-1', segmentId: 's1', vertexId: 'v1' });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(4);
  });
});
