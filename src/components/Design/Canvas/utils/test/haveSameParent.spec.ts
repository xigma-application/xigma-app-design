// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPathNode, TPolygonNode, TSceneNode, TSectionNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { haveSameParent } from '../haveSameParent';

const buildNode = (
  overrides: Partial<Exclude<TBoxSceneNode, TPathNode | TPolygonNode | TSectionNode | TStarNode | TMediaNode | TTextNode>>,
): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 10,
    id: 'node',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('haveSameParent', () => {
  it('should return true when every node shares the same parentId', () => {
    // result
    expect(haveSameParent([buildNode({ parentId: null }), buildNode({ parentId: null })])).toBe(true);
  });

  it('should return true for a single node', () => {
    // result
    expect(haveSameParent([buildNode({ parentId: 'frame-1' })])).toBe(true);
  });

  it('should return false when parentId differs', () => {
    // result
    expect(haveSameParent([buildNode({ parentId: 'frame-1' }), buildNode({ parentId: 'frame-2' })])).toBe(false);
  });
});
