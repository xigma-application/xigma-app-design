// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { isNodeAutoLayoutChild } from '../isNodeAutoLayoutChild';

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

describe('isNodeAutoLayoutChild', () => {
  it('should return true when the node’s parent is an auto-layout frame', () => {
    const autoLayoutFrame = frame({ layoutMode: LayoutMode.vertical });
    const node = rect({ parentId: 'frame-1' });

    expect(isNodeAutoLayoutChild(node, { 'frame-1': autoLayoutFrame })).toBe(true);
  });

  it('should return false when the node’s parent is a plain (non-auto-layout) frame', () => {
    const plainFrame = frame();
    const node = rect({ parentId: 'frame-1' });

    expect(isNodeAutoLayoutChild(node, { 'frame-1': plainFrame })).toBe(false);
  });

  it('should return false when the node has no parent', () => {
    const node = rect({ parentId: null });

    expect(isNodeAutoLayoutChild(node, {})).toBe(false);
  });

  it('should return false when the parent id no longer resolves to a node', () => {
    const node = rect({ parentId: 'gone' });

    expect(isNodeAutoLayoutChild(node, {})).toBe(false);
  });
});
