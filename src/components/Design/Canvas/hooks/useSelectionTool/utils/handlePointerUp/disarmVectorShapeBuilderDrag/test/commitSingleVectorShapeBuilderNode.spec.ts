// store
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { commitSingleVectorShapeBuilderNode } from '../commitSingleVectorShapeBuilderNode';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

// mock — a 100x100 rectangle split in half by a horizontal "divider" segment (e-f), forming a top
// and a bottom face that share exactly that one segment
const splitRectangleNode: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'n1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    bottom: { endId: 'd', id: 'bottom', startId: 'c', tangentEnd: null, tangentStart: null },
    divider: { endId: 'f', id: 'divider', startId: 'e', tangentEnd: null, tangentStart: null },
    leftLower: { endId: 'e', id: 'leftLower', startId: 'd', tangentEnd: null, tangentStart: null },
    leftUpper: { endId: 'a', id: 'leftUpper', startId: 'e', tangentEnd: null, tangentStart: null },
    rightLower: { endId: 'c', id: 'rightLower', startId: 'f', tangentEnd: null, tangentStart: null },
    rightUpper: { endId: 'f', id: 'rightUpper', startId: 'b', tangentEnd: null, tangentStart: null },
    top: { endId: 'b', id: 'top', startId: 'a', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
    e: { id: 'e', x: 0, y: 50 },
    f: { id: 'f', x: 100, y: 50 },
  },
};

describe('commitSingleVectorShapeBuilderNode', () => {
  it('should merge every touched face for a node and dispatch a single updateNode', () => {
    // mock — face keys are the sorted-segment-id strings deriveVectorFaces would produce internally
    const dispatch = vi.fn();
    const faceKeys = new Set(['bottom,divider,leftLower,rightLower', 'divider,leftUpper,rightUpper,top']);

    // action
    commitSingleVectorShapeBuilderNode(dispatch, splitRectangleNode, faceKeys, false);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);

    const action = (dispatch.mock.calls[0] as [ReturnType<typeof updateNode>])[0];
    const changes = action.payload.changes as Partial<TVectorNode>;

    expect(action.payload.id).toBe('n1');
    expect(changes.segments?.divider).toBeUndefined();
    expect(changes.filledFaceKeys).toHaveLength(1);
  });

  it('should not dispatch when the touched face-key set matches nothing on the node', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitSingleVectorShapeBuilderNode(dispatch, splitRectangleNode, new Set(['does-not-exist']), false);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should subtract the touched face — deleting its own exclusive boundary but keeping the divider shared with the untouched neighbor — instead of merging, when isSubtract is true', () => {
    // mock — one face already filled, using the real piece-key loop-key format filledFaceKeys stores
    const [touchedFace] = deriveVectorFaces(splitRectangleNode).filter((face) => face.key === 'divider,leftUpper,rightUpper,top');
    const filledNode: TVectorNode = { ...splitRectangleNode, filledFaceKeys: [getVectorFillLoopKey(touchedFace.pieceKeys)] };
    const dispatch = vi.fn();

    // action
    commitSingleVectorShapeBuilderNode(dispatch, filledNode, new Set(['divider,leftUpper,rightUpper,top']), true);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);

    const action = (dispatch.mock.calls[0] as [ReturnType<typeof updateNode>])[0];
    const changes = action.payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toEqual([]);
    expect(Object.keys(changes.segments ?? {}).sort()).toEqual(['bottom', 'divider', 'leftLower', 'rightLower']);
  });
});
