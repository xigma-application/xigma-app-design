// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { armVectorMultiDrag } from '../armVectorMultiDrag';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const vector: TVectorNode = {
  fillColor: '#000000',
  filledFaceKeys: [],
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

const nodes: Record<string, TSceneNode> = { 'vector-1': vector };
const vectorEditingNodeIds = ['vector-1'];

describe('armVectorMultiDrag', () => {
  it('should snapshot every selected vertex origin, every selected handle origin, and the pointer start, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    armVectorMultiDrag(
      canvas,
      pointerEvent(3),
      canvasRefs,
      nodes,
      vectorEditingNodeIds,
      ['v1', 'v3'],
      [
        { end: 'start', segmentId: 's1' },
        { end: 'end', segmentId: 's1' },
      ],
      { x: 8, y: 9 },
    );

    // result
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current).toEqual({
      boxOrigin: null,
      dispatchThrottle: { frameId: null, run: null },
      handleOrigins: { 'end:s1': { x: -5, y: 0 }, 'start:s1': { x: 5, y: 0 } },
      hasMoved: false,
      pendingClickAction: null,
      pointerStart: { x: 8, y: 9 },
      vertexOrigins: { v1: { x: 0, y: 0 }, v3: { x: 20, y: 10 } },
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should skip a handle whose end has no resolvable tangent', () => {
    // mock — s2's end (v3) has no tangentEnd at all
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    armVectorMultiDrag(canvas, pointerEvent(), canvasRefs, nodes, vectorEditingNodeIds, [], [{ end: 'end', segmentId: 's2' }], {
      x: 0,
      y: 0,
    });

    // result
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.handleOrigins).toEqual({});
  });

  it('should default the pending click action to null when none is given, and store one when given', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    armVectorMultiDrag(
      canvas,
      pointerEvent(),
      canvasRefs,
      nodes,
      vectorEditingNodeIds,
      ['v1'],
      [],
      { x: 0, y: 0 },
      {
        id: 'v1',
        kind: 'vertex',
      },
    );

    // result
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.pendingClickAction).toEqual({ id: 'v1', kind: 'vertex' });
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.hasMoved).toBe(false);
  });

  it('should populate draggedVectorFillFacesRef when a dragged vertex touches a filled face', () => {
    // mock — a filled square, one vertex dragged
    const square: TVectorNode = {
      ...vector,
      filledFaceKeys: [],
      id: 'square',
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 100, y: 0 },
        v3: { id: 'v3', x: 100, y: 100 },
        v4: { id: 'v4', x: 0, y: 100 },
      },
    };
    const filledFaceKeys = deriveVectorFaces(square).map((face) => getVectorFillLoopKey(face.pieceKeys));
    const painted: TVectorNode = { ...square, filledFaceKeys };
    const nodes: Record<string, TSceneNode> = { square: painted };
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    armVectorMultiDrag(canvas, pointerEvent(), canvasRefs, nodes, ['square'], ['v1'], [], { x: 0, y: 0 });

    // result
    expect(canvasRefs.vectorSnapshots.draggedVectorFillFacesRef.current?.square).toHaveLength(1);
  });

  it('should clear draggedVectorFillFacesRef when nothing dragged touches a filled face', () => {
    // mock — no vertices selected
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    armVectorMultiDrag(canvas, pointerEvent(), canvasRefs, nodes, vectorEditingNodeIds, [], [], { x: 0, y: 0 });

    // result
    expect(canvasRefs.vectorSnapshots.draggedVectorFillFacesRef.current).toBeNull();
  });
});
