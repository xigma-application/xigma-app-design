// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPathNode, TPolygonNode, TSceneNode, TSectionNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { isGroupSelection } from '../isGroupSelection';

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

describe('isGroupSelection', () => {
  it('should return true for 2+ nodes sharing the same parent', () => {
    // result
    expect(isGroupSelection([buildNode({ id: 'a' }), buildNode({ id: 'b' })])).toBe(true);
  });

  it('should return true for 2+ nodes with different parents, e.g. a group child selected alongside a top-level sibling', () => {
    // mock — a multi-selection still gets one combined outline/handles regardless of whether every
    // member happens to share the exact same parentId (that stopped being a reliable "flat sibling"
    // signal once nodes could sit inside a group)
    expect(isGroupSelection([buildNode({ id: 'a', parentId: 'group-1' }), buildNode({ id: 'b', parentId: null })])).toBe(true);
  });

  it('should return false for a single node', () => {
    // result
    expect(isGroupSelection([buildNode({ id: 'a' })])).toBe(false);
  });

  it('should return false for an empty selection', () => {
    // result
    expect(isGroupSelection([])).toBe(false);
  });
});
