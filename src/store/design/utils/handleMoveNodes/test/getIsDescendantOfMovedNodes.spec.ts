// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getIsDescendantOfMovedNodes } from '../getIsDescendantOfMovedNodes';

const buildGroup = (overrides: Partial<TGroupNode>): TGroupNode => ({
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

const buildRect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fill: '#ff0000',
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

describe('getIsDescendantOfMovedNodes', () => {
  it('should be false when moving to the root (null target)', () => {
    // action & result
    expect(getIsDescendantOfMovedNodes(null, ['a'], {})).toBe(false);
  });

  it('should be true when the target is one of the moved nodes itself', () => {
    // mock
    const group = buildGroup({ id: 'a' });
    const nodesById: Record<string, TSceneNode> = { a: group };

    // action & result
    expect(getIsDescendantOfMovedNodes('a', ['a'], nodesById)).toBe(true);
  });

  it('should be true when the target is a descendant of a moved node', () => {
    // mock
    const outer = buildGroup({ childIds: ['inner'], id: 'outer' });
    const inner = buildGroup({ childIds: [], id: 'inner', parentId: 'outer' });
    const nodesById: Record<string, TSceneNode> = { inner, outer };

    // action & result
    expect(getIsDescendantOfMovedNodes('inner', ['outer'], nodesById)).toBe(true);
  });

  it('should be false when the target is unrelated to the moved nodes', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const target = buildGroup({ id: 'target' });
    const nodesById: Record<string, TSceneNode> = { a, target };

    // action & result
    expect(getIsDescendantOfMovedNodes('target', ['a'], nodesById)).toBe(false);
  });

  it('should tolerate a target id that does not resolve to a node', () => {
    // action & result
    expect(getIsDescendantOfMovedNodes('missing', ['a'], {})).toBe(false);
  });
});
