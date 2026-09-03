// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { isContainerNode } from '../isContainerNode';

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

describe('isContainerNode', () => {
  it('should return true for a frame', () => {
    expect(isContainerNode(buildFrame())).toBe(true);
  });

  it('should return true for a group', () => {
    expect(isContainerNode(buildGroup())).toBe(true);
  });

  it('should return true for a section', () => {
    expect(isContainerNode(buildSection())).toBe(true);
  });

  it('should return false for a plain leaf node', () => {
    expect(isContainerNode(buildRect())).toBe(false);
  });
});
