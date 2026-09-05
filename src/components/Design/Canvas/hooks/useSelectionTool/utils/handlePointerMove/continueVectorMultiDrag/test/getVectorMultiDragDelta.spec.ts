// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

// utils
import { getVectorMultiDragDelta } from '../getVectorMultiDragDelta';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const dragState = (vertexOrigins: Record<string, { x: number; y: number }>): TVectorMultiDragState => ({
  boxOrigin: null,
  dispatchThrottle: { frameId: null, run: null },
  handleOrigins: {},
  hasMoved: false,
  pendingClickAction: null,
  pointerStart: { x: 0, y: 0 },
  vertexOrigins,
});

describe('getVectorMultiDragDelta', () => {
  it('should return the raw pointer delta and no guide when nothing is nearby to snap to', () => {
    const result = getVectorMultiDragDelta(createCanvas(), pointerEvent(10, 40), IDENTITY_VIEWPORT, {}, dragState({ v1: { x: 0, y: 0 } }));

    expect(result).toEqual({ deltaX: 10, deltaY: 40, guide: null });
  });

  it('should correct the delta and populate a guide when a dragged vertex lands within alignment tolerance of another node’s vertex', () => {
    // mock — v1 starts at (0,0); dragging by (22, 350) lands it at (22, 350), 2px off a's x=20 column
    const nodes: Record<string, TSceneNode> = {
      a: {
        defaultFill: null,
        filledFaceKeys: [],
        id: 'a',
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {},
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { a: { id: 'a', x: 20, y: 900 } },
      },
    };

    const result = getVectorMultiDragDelta(
      createCanvas(),
      pointerEvent(22, 350),
      IDENTITY_VIEWPORT,
      nodes,
      dragState({ v1: { x: 0, y: 0 } }),
    );

    // result — corrected from the raw 22 down to 20, snapping v1 onto a's x=20 column
    expect(result.deltaX).toBe(20);
    expect(result.guide).not.toBeNull();
  });
});
