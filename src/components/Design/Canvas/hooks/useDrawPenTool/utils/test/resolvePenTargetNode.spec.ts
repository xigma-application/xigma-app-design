// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { resolvePenTargetNode } from '../resolvePenTargetNode';

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

describe('resolvePenTargetNode', () => {
  it('should target the owning node when penActiveVertexId belongs to the second open node', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { va: { id: 'va', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { vb: { id: 'vb', x: 100, y: 100 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = resolvePenTargetNode({ x: 0, y: 0 }, ['a', 'b'], nodes, 'vb', 5, 1);

    // result
    expect(result?.id).toBe('b');
  });

  it('should fall back to the primary node when penActiveVertexId does not belong to any open node', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { va: { id: 'va', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { vb: { id: 'vb', x: 100, y: 100 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = resolvePenTargetNode({ x: 0, y: 0 }, ['a', 'b'], nodes, 'missing', 5, 1);

    // result
    expect(result?.id).toBe('a');
  });

  it('should target the node owning the vertex under the point when no active vertex is set', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { va: { id: 'va', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { vb: { id: 'vb', x: 100, y: 100 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = resolvePenTargetNode({ x: 100, y: 100 }, ['a', 'b'], nodes, null, 5, 1);

    // result
    expect(result?.id).toBe('b');
  });

  it('should target the node owning the edge under the point when no vertex is hit', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { va: { id: 'va', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({
      id: 'b',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: {
        v1: { id: 'v1', x: 100, y: 0 },
        v2: { id: 'v2', x: 100, y: 100 },
      },
    });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = resolvePenTargetNode({ x: 100, y: 50 }, ['a', 'b'], nodes, null, 5, 1);

    // result
    expect(result?.id).toBe('b');
  });

  it('should return null for a blank click that touches nothing when multiple nodes are open', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { va: { id: 'va', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { vb: { id: 'vb', x: 100, y: 100 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = resolvePenTargetNode({ x: 500, y: 500 }, ['a', 'b'], nodes, null, 5, 1);

    // result
    expect(result).toBeNull();
  });

  it('should return the primary node for a blank click when only one node is open', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { va: { id: 'va', x: 0, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA };

    // before
    const result = resolvePenTargetNode({ x: 500, y: 500 }, ['a'], nodes, null, 5, 1);

    // result
    expect(result?.id).toBe('a');
  });
});
