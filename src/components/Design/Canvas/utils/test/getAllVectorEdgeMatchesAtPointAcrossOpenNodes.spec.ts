// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getAllVectorEdgeMatchesAtPointAcrossOpenNodes } from '../getAllVectorEdgeMatchesAtPointAcrossOpenNodes';

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

describe('getAllVectorEdgeMatchesAtPointAcrossOpenNodes', () => {
  it('should return null when no node is open for editing', () => {
    // mock
    const node = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getAllVectorEdgeMatchesAtPointAcrossOpenNodes({ x: 5, y: 0 }, [], nodes, 1, 1);

    // result
    expect(result).toBeNull();
  });

  it('should return null when the open node has no matching edge', () => {
    // mock
    const node = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 100 }, v2: { id: 'v2', x: 10, y: 100 } },
    });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getAllVectorEdgeMatchesAtPointAcrossOpenNodes({ x: 5, y: 0 }, ['a'], nodes, 1, 1);

    // result
    expect(result).toBeNull();
  });

  it('should return the single open node’s matches when two of its segments cross the same point', () => {
    // mock — a vertical and a horizontal segment crossing at the origin, both away from any vertex
    const node = buildVectorNode({
      id: 'a',
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      vertices: {
        v1: { id: 'v1', x: 0, y: -10 },
        v2: { id: 'v2', x: 0, y: 10 },
        v3: { id: 'v3', x: -10, y: 0 },
        v4: { id: 'v4', x: 10, y: 0 },
      },
    });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getAllVectorEdgeMatchesAtPointAcrossOpenNodes({ x: 0, y: 0 }, ['a'], nodes, 1, 1);

    // result
    expect(result?.node.id).toBe('a');
    expect(result?.matches.map((match) => match.segmentId).sort()).toEqual(['s1', 's2']);
  });

  it('should pick the open node whose closest matching edge is nearer, across two open nodes', () => {
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
    const result = getAllVectorEdgeMatchesAtPointAcrossOpenNodes({ x: 5, y: 0 }, ['a', 'b'], nodes, 3, 1);

    // result
    expect(result?.node.id).toBe('b');
    expect(result?.matches.map((match) => match.segmentId)).toEqual(['s2']);
  });
});
