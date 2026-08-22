// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { findVectorEditingNodeForSegment } from '../findVectorEditingNodeForSegment';

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

describe('findVectorEditingNodeForSegment', () => {
  it('should return null when the segment id is present in neither open node', () => {
    // mock
    const nodeA = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    });
    const nodeB = buildVectorNode({
      id: 'b',
      segments: { s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null } },
    });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = findVectorEditingNodeForSegment(['a', 'b'], nodes, 'missing');

    // result
    expect(result).toBeNull();
  });

  it('should find the segment on the first open node that owns it', () => {
    // mock
    const nodeA = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    });
    const nodeB = buildVectorNode({
      id: 'b',
      segments: { s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null } },
    });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = findVectorEditingNodeForSegment(['a', 'b'], nodes, 's1');

    // result
    expect(result?.id).toBe('a');
  });

  it('should find the segment on the second open node when it does not belong to the first', () => {
    // mock
    const nodeA = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    });
    const nodeB = buildVectorNode({
      id: 'b',
      segments: { s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null } },
    });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = findVectorEditingNodeForSegment(['a', 'b'], nodes, 's2');

    // result
    expect(result?.id).toBe('b');
  });
});
