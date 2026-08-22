// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getOwningVertexNodes } from '../getOwningVertexNodes';

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

describe('getOwningVertexNodes', () => {
  it('should return each distinct owning node exactly once, even with several selected vertices on the same node', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 1, y: 1 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { v3: { id: 'v3', x: 2, y: 2 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = getOwningVertexNodes(['a', 'b'], nodes, ['v1', 'v2', 'v3']);

    // result
    expect(result.map((node) => node.id)).toEqual(['a', 'b']);
  });

  it('should skip a vertex id that belongs to no currently open node', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 0, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA };

    // before
    const result = getOwningVertexNodes(['a'], nodes, ['missing']);

    // result
    expect(result).toEqual([]);
  });
});
