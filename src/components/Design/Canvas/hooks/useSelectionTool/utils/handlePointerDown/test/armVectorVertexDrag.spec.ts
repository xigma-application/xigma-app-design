import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';
import { TVectorVertexDragState } from 'types/design/selectionTool/types';

// utils
import { armVectorVertexDrag } from '../armVectorVertexDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createVectorVertexDragRef = (): RefObject<TVectorVertexDragState | null> => ({ current: null });

const vector: TVectorNode = {
  fillColor: '#000000',
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 5 } },
};

describe('armVectorVertexDrag', () => {
  it('should record the node id, the dragged vertex origin and the pointer start, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const vectorVertexDragRef = createVectorVertexDragRef();

    // before
    armVectorVertexDrag(canvas, pointerEvent(5), vectorVertexDragRef, vector, 'v2', { x: 30, y: 40 });

    // result
    expect(vectorVertexDragRef.current).toEqual({
      nodeId: 'vector-1',
      origins: { v2: { x: 10, y: 5 } },
      pointerStart: { x: 30, y: 40 },
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(5);
  });
});
