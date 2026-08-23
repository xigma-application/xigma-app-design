// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../../../deriveVectorFaces';
import { getVectorFillLoopKey } from '../../../getVectorFillLoopKey';
import { resolveVectorCutFilledFaceKeys } from '../resolveVectorCutFilledFaceKeys';

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

describe('resolveVectorCutFilledFaceKeys', () => {
  it('should carry over a face’s own current key when its centroid still lands inside its originally-filled self, untouched', () => {
    // mock — an unchanged filled square
    const vertices = {
      v1: { id: 'v1', x: 0, y: 0 },
      v2: { id: 'v2', x: 100, y: 0 },
      v3: { id: 'v3', x: 100, y: 100 },
      v4: { id: 'v4', x: 0, y: 100 },
    };
    const segments = Object.fromEntries([seg('s1', 'v1', 'v2'), seg('s2', 'v2', 'v3'), seg('s3', 'v3', 'v4'), seg('s4', 'v4', 'v1')]);
    const bareNode = buildNode(segments, vertices, []);
    const filledFaceKeys = deriveVectorFaces(bareNode).map((face) => getVectorFillLoopKey(face.pieceKeys));
    const originalNode = buildNode(segments, vertices, filledFaceKeys);

    // before
    const result = resolveVectorCutFilledFaceKeys(originalNode, originalNode, new Set());

    // result
    expect(result).toEqual(filledFaceKeys);
  });

  it('should exclude a face whose centroid lands inside an originally-UNfilled face', () => {
    // mock — a square that was never painted
    const vertices = {
      v1: { id: 'v1', x: 0, y: 0 },
      v2: { id: 'v2', x: 100, y: 0 },
      v3: { id: 'v3', x: 100, y: 100 },
      v4: { id: 'v4', x: 0, y: 100 },
    };
    const segments = Object.fromEntries([seg('s1', 'v1', 'v2'), seg('s2', 'v2', 'v3'), seg('s3', 'v3', 'v4'), seg('s4', 'v4', 'v1')]);
    const originalNode = buildNode(segments, vertices, []); // unpainted

    // before
    const result = resolveVectorCutFilledFaceKeys(originalNode, originalNode, new Set());

    // result
    expect(result).toEqual([]);
  });

  it('should exclude a face bounded by an isolated stub id even though its centroid matches an originally-filled face', () => {
    // mock
    const vertices = {
      v1: { id: 'v1', x: 0, y: 0 },
      v2: { id: 'v2', x: 100, y: 0 },
      v3: { id: 'v3', x: 100, y: 100 },
      v4: { id: 'v4', x: 0, y: 100 },
    };
    const segments = Object.fromEntries([seg('s1', 'v1', 'v2'), seg('s2', 'v2', 'v3'), seg('s3', 'v3', 'v4'), seg('s4', 'v4', 'v1')]);
    const bareNode = buildNode(segments, vertices, []);
    const filledFaceKeys = deriveVectorFaces(bareNode).map((face) => getVectorFillLoopKey(face.pieceKeys));
    const originalNode = buildNode(segments, vertices, filledFaceKeys);
    const isolatedStubIds = new Set(['s1']); // pretend s1 is a leftover isolated stub

    // before
    const result = resolveVectorCutFilledFaceKeys(originalNode, originalNode, isolatedStubIds);

    // result — the square's only face is bounded by s1, so it's excluded outright
    expect(result).toEqual([]);
  });

  it('should exclude a face whose centroid doesn’t land inside any original face at all', () => {
    // mock — the "result" node's square sits far away from the original node's own geometry
    const originalVertices = {
      v1: { id: 'v1', x: 0, y: 0 },
      v2: { id: 'v2', x: 100, y: 0 },
      v3: { id: 'v3', x: 100, y: 100 },
      v4: { id: 'v4', x: 0, y: 100 },
    };
    const originalSegments = Object.fromEntries([
      seg('s1', 'v1', 'v2'),
      seg('s2', 'v2', 'v3'),
      seg('s3', 'v3', 'v4'),
      seg('s4', 'v4', 'v1'),
    ]);
    const bareNode = buildNode(originalSegments, originalVertices, []);
    const filledFaceKeys = deriveVectorFaces(bareNode).map((face) => getVectorFillLoopKey(face.pieceKeys));
    const originalNode = buildNode(originalSegments, originalVertices, filledFaceKeys);

    const resultVertices = {
      v1: { id: 'v1', x: 1000, y: 1000 },
      v2: { id: 'v2', x: 1100, y: 1000 },
      v3: { id: 'v3', x: 1100, y: 1100 },
      v4: { id: 'v4', x: 1000, y: 1100 },
    };
    const resultNode = buildNode(originalSegments, resultVertices, []);

    // before
    const result = resolveVectorCutFilledFaceKeys(resultNode, originalNode, new Set());

    // result
    expect(result).toEqual([]);
  });
});
