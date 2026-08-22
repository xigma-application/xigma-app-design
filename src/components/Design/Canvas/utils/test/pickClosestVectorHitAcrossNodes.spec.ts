// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { pickClosestVectorHitAcrossNodes } from '../pickClosestVectorHitAcrossNodes';

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

describe('pickClosestVectorHitAcrossNodes', () => {
  it('should return null when the node id list is empty', () => {
    // before
    const result = pickClosestVectorHitAcrossNodes(
      [],
      {},
      () => ({ value: 'hit' }),
      () => 0,
    );

    // result
    expect(result).toBeNull();
  });

  it('should return null when the single open node never hits', () => {
    // mock
    const node = buildVectorNode({ id: 'a' });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = pickClosestVectorHitAcrossNodes(
      ['a'],
      nodes,
      () => null,
      () => 0,
    );

    // result
    expect(result).toBeNull();
  });

  it('should return the single open node’s hit', () => {
    // mock
    const node = buildVectorNode({ id: 'a' });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = pickClosestVectorHitAcrossNodes(
      ['a'],
      nodes,
      (bakedNode) => ({ value: bakedNode.id }),
      () => 5,
    );

    // result
    expect(result).toEqual({ hit: { value: 'a' }, node });
  });

  it('should pick the closer of two open nodes that both hit', () => {
    // mock — two open nodes both produce a hit, "b" is closer
    const nodeA = buildVectorNode({ id: 'a' });
    const nodeB = buildVectorNode({ id: 'b' });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = pickClosestVectorHitAcrossNodes(
      ['a', 'b'],
      nodes,
      (bakedNode) => ({ value: bakedNode.id }),
      (bakedNode) => (bakedNode.id === 'b' ? 1 : 10),
    );

    // result
    expect(result).toEqual({ hit: { value: 'b' }, node: nodeB });
  });

  it('should skip a node id that no longer resolves to a vector node', () => {
    // mock
    const node = buildVectorNode({ id: 'a' });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = pickClosestVectorHitAcrossNodes(
      ['missing', 'a'],
      nodes,
      (bakedNode) => ({ value: bakedNode.id }),
      () => 3,
    );

    // result
    expect(result).toEqual({ hit: { value: 'a' }, node });
  });
});
