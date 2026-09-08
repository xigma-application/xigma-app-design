// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getGroupLikeParentIds } from '../getGroupLikeParentIds';

const buildRect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#000',
  height: 10,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildGroup = (overrides: Partial<TGroupNode> = {}): TGroupNode => ({
  childIds: [],
  height: 10,
  id: 'group-1',
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getGroupLikeParentIds', () => {
  it('should return an empty set for an empty id list', () => {
    expect(getGroupLikeParentIds({}, [])).toEqual(new Set());
  });

  it('should return an empty set when the id does not resolve to a node', () => {
    expect(getGroupLikeParentIds({}, ['missing'])).toEqual(new Set());
  });

  it('should return an empty set when the node has no parent', () => {
    const a = buildRect({ id: 'a', parentId: null });
    const nodes: Record<string, TSceneNode> = { a };

    expect(getGroupLikeParentIds(nodes, ['a'])).toEqual(new Set());
  });

  it('should return an empty set when the parent is not group-like', () => {
    const a = buildRect({ id: 'a', parentId: 'frame-1' });
    const frame = buildFrame();
    const nodes: Record<string, TSceneNode> = { a, 'frame-1': frame };

    expect(getGroupLikeParentIds(nodes, ['a'])).toEqual(new Set());
  });

  it('should skip a parent that is itself among the given ids', () => {
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a'] });
    const nodes: Record<string, TSceneNode> = { a, 'group-1': group };

    expect(getGroupLikeParentIds(nodes, ['a', 'group-1'])).toEqual(new Set());
  });

  it('should return the shared group-like parent once, even when two of its children are both given', () => {
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const b = buildRect({ id: 'b', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a', 'b'] });
    const nodes: Record<string, TSceneNode> = { a, b, 'group-1': group };

    expect(getGroupLikeParentIds(nodes, ['a', 'b'])).toEqual(new Set(['group-1']));
  });
});
