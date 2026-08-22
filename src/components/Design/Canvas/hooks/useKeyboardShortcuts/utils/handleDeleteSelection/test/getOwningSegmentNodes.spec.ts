// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getOwningSegmentNodes } from '../getOwningSegmentNodes';

const buildVectorNode = (overrides: Partial<TVectorNode>): TVectorNode => ({
  fillColor: null,
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

describe('getOwningSegmentNodes', () => {
  it('should return each distinct owning node exactly once, even with several selected segments on the same node', () => {
    // mock
    const nodeA = buildVectorNode({
      id: 'a',
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
    });
    const nodeB = buildVectorNode({
      id: 'b',
      segments: { s3: { endId: 'v6', id: 's3', startId: 'v5', tangentEnd: null, tangentStart: null } },
    });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = getOwningSegmentNodes(['a', 'b'], nodes, ['s1', 's2', 's3']);

    // result
    expect(result.map((node) => node.id)).toEqual(['a', 'b']);
  });

  it('should skip a segment id that belongs to no currently open node', () => {
    // mock
    const nodeA = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    });
    const nodes: Record<string, TSceneNode> = { a: nodeA };

    // before
    const result = getOwningSegmentNodes(['a'], nodes, ['missing']);

    // result
    expect(result).toEqual([]);
  });
});
