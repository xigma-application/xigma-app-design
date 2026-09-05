// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode } from 'types/design/types';

// utils
import { isAutoLayoutFrame } from '../isAutoLayoutFrame';

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

describe('isAutoLayoutFrame', () => {
  it('should return true for a frame with a horizontal layout mode', () => {
    // result
    expect(isAutoLayoutFrame(frame({ layoutMode: LayoutMode.horizontal }))).toBe(true);
  });

  it('should return true for a frame with a vertical layout mode', () => {
    // result
    expect(isAutoLayoutFrame(frame({ layoutMode: LayoutMode.vertical }))).toBe(true);
  });

  it('should return false for a frame with no layout mode set', () => {
    // result
    expect(isAutoLayoutFrame(frame())).toBe(false);
  });

  it('should return false for a non-frame container node', () => {
    // mock
    const group: TGroupNode = {
      childIds: [],
      height: 100,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 100,
      x: 0,
      y: 0,
    };

    // result
    expect(isAutoLayoutFrame(group)).toBe(false);
  });

  it('should return false when there is no candidate node', () => {
    // result
    expect(isAutoLayoutFrame(null)).toBe(false);
  });
});
