// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getExportSubtreeNodes } from '../getExportSubtreeNodes';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fills: [],
  height: 100,
  id: 'frame',
  name: 'frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 10,
  id: 'rect',
  name: 'rect',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getExportSubtreeNodes', () => {
  it('should return an empty list when the node does not exist', () => {
    expect(getExportSubtreeNodes('missing', {})).toEqual([]);
  });

  it('should return an empty list when the node itself is hidden', () => {
    const node = rect({ hidden: true });

    expect(getExportSubtreeNodes('rect', { rect: node })).toEqual([]);
  });

  it('should return a leaf node by itself', () => {
    const node = rect();

    expect(getExportSubtreeNodes('rect', { rect: node })).toEqual([node]);
  });

  it('should return a container node followed by its children in order, root-first', () => {
    const child1 = rect({ id: 'child1', parentId: 'frame' });
    const child2 = rect({ id: 'child2', parentId: 'frame' });
    const root = frame({ childIds: ['child1', 'child2'] });
    const nodesById: Record<string, TSceneNode> = { child1, child2, frame: root };

    expect(getExportSubtreeNodes('frame', nodesById)).toEqual([root, child1, child2]);
  });

  it('should skip a hidden descendant but still walk its own children out from under it', () => {
    const grandchild = rect({ id: 'grandchild', parentId: 'child' });
    const child = frame({ childIds: ['grandchild'], hidden: true, id: 'child', parentId: 'frame' });
    const root = frame({ childIds: ['child'] });
    const nodesById: Record<string, TSceneNode> = { child, frame: root, grandchild };

    expect(getExportSubtreeNodes('frame', nodesById)).toEqual([root]);
  });

  it('should recurse through nested containers', () => {
    const grandchild = rect({ id: 'grandchild', parentId: 'child' });
    const child = frame({ childIds: ['grandchild'], id: 'child', parentId: 'frame' });
    const root = frame({ childIds: ['child'] });
    const nodesById: Record<string, TSceneNode> = { child, frame: root, grandchild };

    expect(getExportSubtreeNodes('frame', nodesById)).toEqual([root, child, grandchild]);
  });
});
