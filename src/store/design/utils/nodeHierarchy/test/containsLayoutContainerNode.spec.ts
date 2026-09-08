// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TMaskNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { containsLayoutContainerNode } from '../containsLayoutContainerNode';

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

const buildSection = (overrides: Partial<TSectionNode> = {}): TSectionNode => ({
  childIds: [],
  fill: '#fff',
  height: 10,
  id: 'section-1',
  name: 'Section',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
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

const buildMask = (overrides: Partial<TMaskNode> = {}): TMaskNode => ({
  childIds: [],
  height: 10,
  id: 'mask-1',
  name: 'Mask group',
  parentId: null,
  rotation: 0,
  type: NodeType.mask,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

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

describe('containsLayoutContainerNode', () => {
  it('should return true for a frame itself', () => {
    expect(containsLayoutContainerNode(buildFrame(), {})).toBe(true);
  });

  it('should return true for a section itself', () => {
    expect(containsLayoutContainerNode(buildSection(), {})).toBe(true);
  });

  it('should return false for a plain leaf node', () => {
    expect(containsLayoutContainerNode(buildRect(), {})).toBe(false);
  });

  it('should return false for a group of plain leaf nodes', () => {
    const rect = buildRect({ parentId: 'group-1' });
    const group = buildGroup({ childIds: ['rect-1'] });
    const nodes: Record<string, TSceneNode> = { 'group-1': group, 'rect-1': rect };

    expect(containsLayoutContainerNode(group, nodes)).toBe(false);
  });

  it('should return true for a group that directly contains a frame', () => {
    const frame = buildFrame({ parentId: 'group-1' });
    const group = buildGroup({ childIds: ['frame-1'] });
    const nodes: Record<string, TSceneNode> = { 'frame-1': frame, 'group-1': group };

    expect(containsLayoutContainerNode(group, nodes)).toBe(true);
  });

  it('should recurse arbitrarily deep to find a frame nested inside nested groups', () => {
    const frame = buildFrame({ id: 'inner-frame', parentId: 'inner-group' });
    const innerGroup = buildGroup({ childIds: ['inner-frame'], id: 'inner-group', parentId: 'outer-group' });
    const outerGroup = buildGroup({ childIds: ['inner-group'], id: 'outer-group' });
    const nodes: Record<string, TSceneNode> = { 'inner-frame': frame, 'inner-group': innerGroup, 'outer-group': outerGroup };

    expect(containsLayoutContainerNode(outerGroup, nodes)).toBe(true);
  });

  it('should recurse into a nested mask container the same way as a group', () => {
    const section = buildSection({ parentId: 'mask-1' });
    const mask = buildMask({ childIds: ['section-1'] });
    const nodes: Record<string, TSceneNode> = { 'mask-1': mask, 'section-1': section };

    expect(containsLayoutContainerNode(mask, nodes)).toBe(true);
  });

  it('should ignore a dangling child id that no longer resolves to a node', () => {
    const group = buildGroup({ childIds: ['missing'] });

    expect(containsLayoutContainerNode(group, {})).toBe(false);
  });
});
