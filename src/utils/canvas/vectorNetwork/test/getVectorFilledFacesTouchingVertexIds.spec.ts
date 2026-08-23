// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../deriveVectorFaces';
import { getVectorFilledFacesTouchingVertexIds } from '../getVectorFilledFacesTouchingVertexIds';
import { getVectorFillLoopKey } from '../getVectorFillLoopKey';

const seg = (id: string, startId: string, endId: string): [string, TVectorSegment] => [
  id,
  { endId, id, startId, tangentEnd: null, tangentStart: null },
];

const buildNode = (
  segments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
  filledFaceKeys: string[],
): TVectorNode => ({
  fillColor: null,
  filledFaceKeys,
  id: 'n1',
  name: 'node',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

// mock — a square split into a top and bottom half by an internal divider s7 (v3<->v6)
const vertices: Record<string, TVectorVertex> = {
  v1: { id: 'v1', x: 0, y: 0 },
  v2: { id: 'v2', x: 100, y: 0 },
  v3: { id: 'v3', x: 100, y: 50 },
  v4: { id: 'v4', x: 100, y: 100 },
  v5: { id: 'v5', x: 0, y: 100 },
  v6: { id: 'v6', x: 0, y: 50 },
};
const segments = Object.fromEntries([
  seg('s1', 'v1', 'v2'),
  seg('s2', 'v2', 'v3'),
  seg('s3', 'v3', 'v4'),
  seg('s4', 'v4', 'v5'),
  seg('s5', 'v5', 'v6'),
  seg('s6', 'v6', 'v1'),
  seg('s7', 'v3', 'v6'),
]);

describe('getVectorFilledFacesTouchingVertexIds', () => {
  it('should return both faces when the dragged vertex sits on the shared divider and both faces are filled', () => {
    // mock
    const bareNode = buildNode(segments, vertices, []);
    const filledFaceKeys = deriveVectorFaces(bareNode).map((face) => getVectorFillLoopKey(face.pieceKeys));
    const node = buildNode(segments, vertices, filledFaceKeys);

    // before
    const result = getVectorFilledFacesTouchingVertexIds(node, ['v3']);

    // result
    expect(result).toHaveLength(2);
  });

  it('should return only the one face touched by a vertex that isn’t on the shared divider', () => {
    // mock
    const bareNode = buildNode(segments, vertices, []);
    const filledFaceKeys = deriveVectorFaces(bareNode).map((face) => getVectorFillLoopKey(face.pieceKeys));
    const node = buildNode(segments, vertices, filledFaceKeys);

    // before
    const result = getVectorFilledFacesTouchingVertexIds(node, ['v1']);

    // result
    expect(result).toHaveLength(1);
  });

  it('should exclude a touched face that isn’t filled', () => {
    // mock — nothing painted
    const node = buildNode(segments, vertices, []);

    // before
    const result = getVectorFilledFacesTouchingVertexIds(node, ['v1']);

    // result
    expect(result).toEqual([]);
  });

  it('should return an empty array for a vertex id with no incident segments', () => {
    // mock
    const bareNode = buildNode(segments, vertices, []);
    const filledFaceKeys = deriveVectorFaces(bareNode).map((face) => getVectorFillLoopKey(face.pieceKeys));
    const node = buildNode(segments, vertices, filledFaceKeys);

    // before
    const result = getVectorFilledFacesTouchingVertexIds(node, ['does-not-exist']);

    // result
    expect(result).toEqual([]);
  });
});
