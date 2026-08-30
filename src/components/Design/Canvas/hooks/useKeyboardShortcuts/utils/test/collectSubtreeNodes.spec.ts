// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TSceneNode } from 'types/design/types';

// utils
import { collectSubtreeNodes } from '../collectSubtreeNodes';

const buildFrame = (overrides: Partial<TFrameNode>): TFrameNode => ({
  fill: '#ff0000',
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

describe('collectSubtreeNodes', () => {
  it('should return just the root node when it has no children', () => {
    // mock
    const a = buildFrame({ id: 'a' });
    const nodes: Record<string, TSceneNode> = { a };

    // action & result
    expect(collectSubtreeNodes(nodes, ['a'])).toEqual([a]);
  });

  it('should include every descendant of a selected group, at every depth', () => {
    // mock
    const a = buildFrame({ id: 'a', parentId: 'inner' });
    const inner = buildGroup({ childIds: ['a'], id: 'inner', parentId: 'outer' });
    const outer = buildGroup({ childIds: ['inner'], id: 'outer' });
    const nodes: Record<string, TSceneNode> = { a, inner, outer };

    // action
    const result = collectSubtreeNodes(nodes, ['outer']);

    // result
    expect(result.map((node) => node.id).sort()).toEqual(['a', 'inner', 'outer']);
  });

  it('should collect multiple selected roots and dedupe shared descendants visited more than once', () => {
    // mock — two selected roots that share no nodes, plus a standalone selected node
    const a = buildFrame({ id: 'a', parentId: 'group-1' });
    const group1 = buildGroup({ childIds: ['a'], id: 'group-1' });
    const b = buildFrame({ id: 'b' });
    const nodes: Record<string, TSceneNode> = { a, b, 'group-1': group1 };

    // action
    const result = collectSubtreeNodes(nodes, ['group-1', 'b']);

    // result
    expect(result.map((node) => node.id).sort()).toEqual(['a', 'b', 'group-1']);
  });

  it('should tolerate a group whose child id no longer resolves to a node, skipping it', () => {
    // mock
    const a = buildFrame({ id: 'a', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a', 'gone'], id: 'group-1' });
    const nodes: Record<string, TSceneNode> = { a, 'group-1': group };

    // action
    const result = collectSubtreeNodes(nodes, ['group-1']);

    // result
    expect(result.map((node) => node.id).sort()).toEqual(['a', 'group-1']);
  });

  it('should return an empty array for a root id that does not resolve to a node', () => {
    // action & result
    expect(collectSubtreeNodes({}, ['missing'])).toEqual([]);
  });
});
