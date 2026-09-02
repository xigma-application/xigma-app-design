// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getRemainingSegments } from '../getRemainingSegments';

const buildVectorNode = (overrides: Partial<TVectorNode>): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('getRemainingSegments', () => {
  it('should drop a segment touching a selected vertex at either end', () => {
    // mock
    const node = buildVectorNode({
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
    });

    // before
    const result = getRemainingSegments(node, ['v2']);

    // result — both segments touch v2, one as startId and one as endId
    expect(result).toEqual({});
  });

  it('should keep a segment whose endpoints are not selected', () => {
    // mock
    const node = buildVectorNode({
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    });

    // before
    const result = getRemainingSegments(node, ['v3']);

    // result
    expect(result).toEqual(node.segments);
  });
});
