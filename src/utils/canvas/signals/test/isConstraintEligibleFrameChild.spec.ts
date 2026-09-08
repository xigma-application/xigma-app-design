// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { isConstraintEligibleFrameChild } from '../isConstraintEligibleFrameChild';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#000',
  height: 10,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const group = (overrides: Partial<TGroupNode> = {}): TGroupNode => ({
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

describe('isConstraintEligibleFrameChild', () => {
  it('should return true for a direct child of a freeform frame', () => {
    const node = rect({ parentId: 'frame-1' });

    expect(isConstraintEligibleFrameChild(node, { 'frame-1': frame() })).toBe(true);
  });

  it('should return false for a plain flow child of a horizontal/vertical auto-layout frame', () => {
    const node = rect({ parentId: 'frame-1' });

    expect(isConstraintEligibleFrameChild(node, { 'frame-1': frame({ layoutMode: LayoutMode.horizontal }) })).toBe(false);
  });

  it('should return true for an ignoreAutoLayout (absolute) child of an auto-layout frame', () => {
    const node = rect({ ignoreAutoLayout: true, parentId: 'frame-1' });

    expect(isConstraintEligibleFrameChild(node, { 'frame-1': frame({ layoutMode: LayoutMode.vertical }) })).toBe(true);
  });

  it('should return false for a child of a grid frame, even absolute', () => {
    const node = rect({ ignoreAutoLayout: true, parentId: 'frame-1' });

    expect(isConstraintEligibleFrameChild(node, { 'frame-1': frame({ layoutMode: LayoutMode.grid }) })).toBe(false);
  });

  it('should return true for a Group node that is itself a freeform frame’s child', () => {
    const node = group({ parentId: 'frame-1' });

    expect(isConstraintEligibleFrameChild(node, { 'frame-1': frame() })).toBe(true);
  });

  it('should return false for a leaf whose parent is the group, not the frame', () => {
    const leaf = rect({ parentId: 'group-1' });
    const nodes = { 'frame-1': frame({ childIds: ['group-1'] }), 'group-1': group({ childIds: ['r1'], parentId: 'frame-1' }) };

    expect(isConstraintEligibleFrameChild(leaf, nodes)).toBe(false);
  });

  it('should return false for a node with no parent', () => {
    expect(isConstraintEligibleFrameChild(rect({ parentId: null }), {})).toBe(false);
  });

  it('should return false when the parent id does not resolve to a node', () => {
    expect(isConstraintEligibleFrameChild(rect({ parentId: 'gone' }), {})).toBe(false);
  });

  it('should return false for a non-box child (a line) of a freeform frame', () => {
    const line: TLineNode = {
      id: 'l1',
      name: 'Line',
      parentId: 'frame-1',
      stroke: '#000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 10,
    };

    expect(isConstraintEligibleFrameChild(line, { 'frame-1': frame() })).toBe(false);
  });
});
