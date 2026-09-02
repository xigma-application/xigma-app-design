// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { findVectorEditingNodeForVertex } from '../findVectorEditingNodeForVertex';

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

describe('findVectorEditingNodeForVertex', () => {
  it('should return null when the vertex id is present in neither open node', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { v2: { id: 'v2', x: 0, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = findVectorEditingNodeForVertex(['a', 'b'], nodes, 'missing');

    // result
    expect(result).toBeNull();
  });

  it('should find the vertex on the first open node that owns it', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { v2: { id: 'v2', x: 0, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = findVectorEditingNodeForVertex(['a', 'b'], nodes, 'v1');

    // result
    expect(result?.id).toBe('a');
  });

  it('should find the vertex on the second open node when it does not belong to the first', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { v2: { id: 'v2', x: 0, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = findVectorEditingNodeForVertex(['a', 'b'], nodes, 'v2');

    // result
    expect(result?.id).toBe('b');
  });
});
