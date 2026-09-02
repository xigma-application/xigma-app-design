// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorEdgeAtPointAcrossOpenNodes } from '../getVectorEdgeAtPointAcrossOpenNodes';

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

describe('getVectorEdgeAtPointAcrossOpenNodes', () => {
  it('should return null when no node is open for editing', () => {
    // mock
    const node = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getVectorEdgeAtPointAcrossOpenNodes({ x: 5, y: 0 }, [], nodes, 1, 1);

    // result
    expect(result).toBeNull();
  });

  it('should hit the edge on the single open node', () => {
    // mock
    const node = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getVectorEdgeAtPointAcrossOpenNodes({ x: 2, y: 0 }, ['a'], nodes, 1, 1);

    // result
    expect(result?.node.id).toBe('a');
    expect(result?.hit.segmentId).toBe('s1');
  });

  it('should pick the closer edge when two open nodes both hit', () => {
    // mock — "b"'s segment sits right at the query point, "a"'s sits a couple of units away
    const nodeA = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 2 }, v2: { id: 'v2', x: 10, y: 2 } },
    });
    const nodeB = buildVectorNode({
      id: 'b',
      segments: { s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null } },
      vertices: { v3: { id: 'v3', x: 0, y: 0 }, v4: { id: 'v4', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = getVectorEdgeAtPointAcrossOpenNodes({ x: 5, y: 0 }, ['a', 'b'], nodes, 3, 1);

    // result
    expect(result?.node.id).toBe('b');
    expect(result?.hit.segmentId).toBe('s2');
  });
});
