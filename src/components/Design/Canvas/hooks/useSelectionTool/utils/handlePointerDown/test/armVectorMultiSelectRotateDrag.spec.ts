import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { armVectorMultiSelectRotateDrag } from '../armVectorMultiSelectRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createVectorMultiSelectRotateDragRef = (): RefObject<TVectorMultiSelectRotateDragState | null> => ({ current: null });

const vector: TVectorNode = {
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
};

const nodes: Record<string, TSceneNode> = { 'vector-1': vector };
const vectorEditingNodeIds = ['vector-1'];

describe('armVectorMultiSelectRotateDrag', () => {
  it('should snapshot the pivot (bounds center), start angle, cursor angle, vertex origins, and handle origins, then capture the pointer', () => {
    // mock — bounds center (5, 0); pointer grabbed at (10, 0), due east of the pivot
    const canvas = createCanvas();
    const rotateDragRef = createVectorMultiSelectRotateDragRef();
    const bounds = { height: 0, width: 10, x: 0, y: 0 };

    // before
    armVectorMultiSelectRotateDrag(
      canvas,
      pointerEvent(3),
      rotateDragRef,
      nodes,
      vectorEditingNodeIds,
      ['v1', 'v2'],
      [{ end: 'start', segmentId: 's1' }],
      bounds,
      0,
      { x: 10, y: 0 },
    );

    // result
    expect(rotateDragRef.current).toEqual({
      bounds,
      cursorAngle: 90,
      deltaDegrees: 0,
      handleOrigins: { 'start:s1': { x: 5, y: 0 } },
      pivot: { x: 5, y: 0 },
      rotation: 0,
      startAngle: 0,
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 0 } },
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
