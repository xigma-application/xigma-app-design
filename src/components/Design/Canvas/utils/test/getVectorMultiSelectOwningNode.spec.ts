// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorMultiSelectOwningNode } from '../getVectorMultiSelectOwningNode';

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

describe('getVectorMultiSelectOwningNode', () => {
  it('should return the node that owns every selected vertex', () => {
    // mock
    const node = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getVectorMultiSelectOwningNode(['a'], nodes, ['v1', 'v2'], []);

    // result
    expect(result?.id).toBe('a');
  });

  it('should return null when the selection spans two different open nodes', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { v2: { id: 'v2', x: 0, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = getVectorMultiSelectOwningNode(['a', 'b'], nodes, ['v1', 'v2'], []);

    // result
    expect(result).toBeNull();
  });

  it('should return the node that owns every selected handle’s segment', () => {
    // mock
    const node = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getVectorMultiSelectOwningNode(['a'], nodes, [], [{ end: 'start', segmentId: 's1' }]);

    // result
    expect(result?.id).toBe('a');
  });

  it('should return null when no open node owns the full selection', () => {
    // mock
    const node = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 0, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getVectorMultiSelectOwningNode(['a'], nodes, ['missing'], []);

    // result
    expect(result).toBeNull();
  });
});
