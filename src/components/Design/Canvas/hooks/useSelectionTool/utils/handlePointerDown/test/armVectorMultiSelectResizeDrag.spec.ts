import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { armVectorMultiSelectResizeDrag } from '../armVectorMultiSelectResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createVectorMultiSelectResizeDragRef = (): RefObject<TVectorMultiSelectResizeDragState | null> => ({ current: null });

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
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 5 } },
};

const nodes: Record<string, TSceneNode> = { 'vector-1': vector };
const vectorEditingNodeIds = ['vector-1'];

describe('armVectorMultiSelectResizeDrag', () => {
  it('should snapshot the bounds, handle, vertex origins, and handle origins, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createVectorMultiSelectResizeDragRef();
    const bounds = { height: 5, width: 10, x: 0, y: 0 };

    // before
    armVectorMultiSelectResizeDrag(
      canvas,
      pointerEvent(3),
      resizeDragRef,
      nodes,
      vectorEditingNodeIds,
      ['v1', 'v2'],
      [{ end: 'start', segmentId: 's1' }],
      bounds,
      0,
      'se',
    );

    // result — bounds are (0,0,10,5); the 'se' handle anchors from the opposite ('nw') corner, (0,0),
    // which stays put under a 0deg rotation, so anchorWorld lands on that same (0,0) point
    expect(resizeDragRef.current).toEqual({
      anchor: { x: 0, y: 0 },
      anchorWorld: { x: 0, y: 0 },
      bounds,
      handle: 'se',
      handleOrigins: { 'start:s1': { x: 5, y: 0 } },
      liveBounds: bounds,
      rotation: 0,
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 5 } },
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
