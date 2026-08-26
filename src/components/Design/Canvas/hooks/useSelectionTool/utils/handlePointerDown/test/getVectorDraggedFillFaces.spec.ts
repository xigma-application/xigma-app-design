// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorDraggedFillFaces } from '../getVectorDraggedFillFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

const seg = (id: string, startId: string, endId: string): [string, TVectorSegment] => [
  id,
  { endId, id, startId, tangentEnd: null, tangentStart: null },
];

const buildSquare = (id: string, offsetX: number, filled: boolean, vertexPrefix = ''): TVectorNode => {
  const v = (name: string): string => `${vertexPrefix}${name}`;
  const vertices: Record<string, TVectorVertex> = {
    [v('v1')]: { id: v('v1'), x: offsetX, y: 0 },
    [v('v2')]: { id: v('v2'), x: offsetX + 100, y: 0 },
    [v('v3')]: { id: v('v3'), x: offsetX + 100, y: 100 },
    [v('v4')]: { id: v('v4'), x: offsetX, y: 100 },
  };
  const segments = Object.fromEntries([
    seg('s1', v('v1'), v('v2')),
    seg('s2', v('v2'), v('v3')),
    seg('s3', v('v3'), v('v4')),
    seg('s4', v('v4'), v('v1')),
  ]);
  const bareNode: TVectorNode = {
    fillColor: null,
    filledFaceKeys: [],
    id,
    name: 'square',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  };
  const filledFaceKeys = filled ? deriveVectorFaces(bareNode).map((face) => getVectorFillLoopKey(face.pieceKeys)) : [];

  return { ...bareNode, filledFaceKeys };
};

describe('getVectorDraggedFillFaces', () => {
  it('should return the touched filled face keyed by the vertex’s own node', () => {
    // mock
    const node = buildSquare('n1', 0, true);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // before
    const result = getVectorDraggedFillFaces(nodes, ['n1'], ['v1']);

    // result
    expect(result?.n1).toHaveLength(1);
  });

  it('should return null when the dragged vertex touches no filled face', () => {
    // mock
    const node = buildSquare('n1', 0, false);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // before
    const result = getVectorDraggedFillFaces(nodes, ['n1'], ['v1']);

    // result
    expect(result).toBeNull();
  });

  it('should ignore a vertex id that doesn’t resolve to any currently-open node', () => {
    // mock
    const node = buildSquare('n1', 0, true);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // before
    const result = getVectorDraggedFillFaces(nodes, ['n1'], ['missing-vertex']);

    // result
    expect(result).toBeNull();
  });

  it('should combine touched filled faces from a cross-node vertex selection into one record', () => {
    // mock — two separately-filled squares (distinct vertex ids), one vertex dragged from each
    const nodeA = buildSquare('n1', 0, true, 'a-');
    const nodeB = buildSquare('n2', 500, true, 'b-');
    const nodes: Record<string, TSceneNode> = { n1: nodeA, n2: nodeB };

    // before
    const result = getVectorDraggedFillFaces(nodes, ['n1', 'n2'], ['a-v1', 'b-v2']);

    // result
    expect(result?.n1).toHaveLength(1);
    expect(result?.n2).toHaveLength(1);
  });

  it('should return null for an empty vertex id list', () => {
    // mock
    const node = buildSquare('n1', 0, true);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // before
    const result = getVectorDraggedFillFaces(nodes, ['n1'], []);

    // result
    expect(result).toBeNull();
  });
});
