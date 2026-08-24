// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { extractVectorFragment } from '../extractVectorFragment';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: { v1: 'symmetric' },
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 20, y: 0 } },
  ...overrides,
});

describe('extractVectorFragment', () => {
  it('should pull only the explicitly selected vertex when nothing else is selected', () => {
    // action
    const fragment = extractVectorFragment(buildNode(), ['v3'], []);

    // result
    expect(fragment.vertices).toEqual([{ id: 'v3', x: 20, y: 0 }]);
    expect(fragment.segments).toEqual([]);
  });

  it('should pull a selected segment along with both of its endpoints, even if they were not separately selected', () => {
    // action
    const fragment = extractVectorFragment(buildNode(), [], ['s1']);

    // result
    expect(fragment.vertices.map((vertex) => vertex.id).sort()).toEqual(['v1', 'v2']);
    expect(fragment.segments).toEqual([{ endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null }]);
  });

  it('should auto-include a segment whose both endpoints are already in the selected vertex set', () => {
    // action
    const fragment = extractVectorFragment(buildNode(), ['v1', 'v2'], []);

    // result
    expect(fragment.segments).toEqual([{ endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null }]);
  });

  it('should carry over vertexHandleModes only for included vertices that actually had one set', () => {
    // action
    const fragment = extractVectorFragment(buildNode(), ['v1', 'v3'], []);

    // result
    expect(fragment.vertexHandleModes).toEqual({ v1: 'symmetric' });
  });

  it('should include a filled face fully bounded by the selected vertices in filledFacePieceKeySets', () => {
    // mock — a closed, filled square
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
    const bareSquare = buildNode({ segments: squareSegments, vertexHandleModes: {}, vertices: squareVertices });
    const filledFaceKeys = deriveVectorFaces(bareSquare).map((face) => getVectorFillLoopKey(face.pieceKeys));
    const filledSquare = buildNode({ filledFaceKeys, segments: squareSegments, vertexHandleModes: {}, vertices: squareVertices });

    // action
    const fragment = extractVectorFragment(filledSquare, ['v1', 'v2', 'v3', 'v4'], []);

    // result
    expect(fragment.filledFacePieceKeySets).toHaveLength(1);
    expect(fragment.filledFacePieceKeySets[0].map((pieceKey) => pieceKey.split('[')[0]).sort()).toEqual(['s1', 's2', 's3', 's4']);
  });

  it('should not include an unfilled face even when fully bounded by the selected vertices', () => {
    // mock — same square, but never painted
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
    const unfilledSquare = buildNode({ segments: squareSegments, vertexHandleModes: {}, vertices: squareVertices });

    // action
    const fragment = extractVectorFragment(unfilledSquare, ['v1', 'v2', 'v3', 'v4'], []);

    // result
    expect(fragment.filledFacePieceKeySets).toEqual([]);
  });
});
