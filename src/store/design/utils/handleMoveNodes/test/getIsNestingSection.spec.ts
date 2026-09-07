// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { getIsNestingSection } from '../getIsNestingSection';

const buildFrame = (overrides: Partial<TFrameNode>): TFrameNode => ({
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

const buildSection: (overrides: Partial<TSectionNode>) => TSectionNode = (overrides) => ({
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

describe('getIsNestingSection', () => {
  it('should be false when the target is the root (null)', () => {
    expect(getIsNestingSection(null, ['a'], {})).toBe(false);
  });

  it('should be true when moving a section into a container node', () => {
    // mock
    const frame = buildFrame({ id: 'frame-1' });
    const section = buildSection({ id: 'a' });
    const nodesById: Record<string, TSceneNode> = { a: section, 'frame-1': frame };

    expect(getIsNestingSection('frame-1', ['a'], nodesById)).toBe(true);
  });

  it('should be false when moving a non-section node into a container node', () => {
    // mock
    const frame = buildFrame({ id: 'frame-1' });
    const rect = buildRect({ id: 'a' });
    const nodesById: Record<string, TSceneNode> = { a: rect, 'frame-1': frame };

    expect(getIsNestingSection('frame-1', ['a'], nodesById)).toBe(false);
  });

  it('should be false when the target is not a container node', () => {
    // mock
    const targetRect = buildRect({ id: 'target' });
    const section = buildSection({ id: 'a' });
    const nodesById: Record<string, TSceneNode> = { a: section, target: targetRect };

    expect(getIsNestingSection('target', ['a'], nodesById)).toBe(false);
  });
});
