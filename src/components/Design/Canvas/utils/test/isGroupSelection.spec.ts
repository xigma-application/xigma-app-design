// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPathNode, TPolygonNode, TSceneNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { isGroupSelection } from '../isGroupSelection';

const buildNode = (
  overrides: Partial<Exclude<TBoxSceneNode, TPathNode | TPolygonNode | TStarNode | TMediaNode | TTextNode>>,
): TSceneNode => ({
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
});

describe('isGroupSelection', () => {
  it('should return true for 2+ nodes sharing the same parent', () => {
    // result
    expect(isGroupSelection([buildNode({ id: 'a' }), buildNode({ id: 'b' })])).toBe(true);
  });

  it('should return false for a single node', () => {
    // result
    expect(isGroupSelection([buildNode({ id: 'a' })])).toBe(false);
  });

  it('should return false for an empty selection', () => {
    // result
    expect(isGroupSelection([])).toBe(false);
  });

  it('should return false when parents differ', () => {
    // result
    expect(isGroupSelection([buildNode({ id: 'a', parentId: 'frame-1' }), buildNode({ id: 'b', parentId: 'frame-2' })])).toBe(false);
  });
});
