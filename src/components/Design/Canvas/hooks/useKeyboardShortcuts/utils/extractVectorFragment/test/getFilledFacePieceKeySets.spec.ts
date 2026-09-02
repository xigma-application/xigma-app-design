// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getFilledFacePieceKeySets } from '../getFilledFacePieceKeySets';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

const squareSegments: Record<string, TVectorSegment> = {
  s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
  s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
  s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
  s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
};

const squareVertices = {
  v1: { id: 'v1', x: 0, y: 0 },
  v2: { id: 'v2', x: 10, y: 0 },
  v3: { id: 'v3', x: 10, y: 10 },
  v4: { id: 'v4', x: 0, y: 10 },
};

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: squareSegments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: squareVertices,
  ...overrides,
});

describe('getFilledFacePieceKeySets', () => {
  it('should include a filled face whose every real segment id is in the given segment id set', () => {
    // mock
    const bareSquare = buildNode();
    const filledFaceKeys = deriveVectorFaces(bareSquare).map((face) => getVectorFillLoopKey(face.pieceKeys));
    const filledSquare = buildNode({ filledFaceKeys });

    // before
    const result = getFilledFacePieceKeySets(filledSquare, new Set(['s1', 's2', 's3', 's4']));

    // result
    expect(result).toHaveLength(1);
    expect(result[0].map((pieceKey) => pieceKey.split('[')[0]).sort()).toEqual(['s1', 's2', 's3', 's4']);
  });

  it('should not include an unfilled face even when every real segment id is in the given segment id set', () => {
    // mock — same square, but never painted (empty filledFaceKeys)
    const unfilledSquare = buildNode();

    // before
    const result = getFilledFacePieceKeySets(unfilledSquare, new Set(['s1', 's2', 's3', 's4']));

    // result
    expect(result).toEqual([]);
  });

  it('should not include a filled face when the given segment id set is missing one of its real segments', () => {
    // mock
    const bareSquare = buildNode();
    const filledFaceKeys = deriveVectorFaces(bareSquare).map((face) => getVectorFillLoopKey(face.pieceKeys));
    const filledSquare = buildNode({ filledFaceKeys });

    // before — s4 missing from the segment id set
    const result = getFilledFacePieceKeySets(filledSquare, new Set(['s1', 's2', 's3']));

    // result
    expect(result).toEqual([]);
  });
});
