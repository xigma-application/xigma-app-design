// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode } from 'types/design/types';

// utils
import { isManagedLayoutFrame } from '../isManagedLayoutFrame';

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

describe('isManagedLayoutFrame', () => {
  it('should return true for a horizontal auto-layout frame', () => {
    expect(isManagedLayoutFrame(buildFrame({ layoutMode: LayoutMode.horizontal }))).toBe(true);
  });

  it('should return true for a vertical auto-layout frame', () => {
    expect(isManagedLayoutFrame(buildFrame({ layoutMode: LayoutMode.vertical }))).toBe(true);
  });

  it('should return true for a grid frame', () => {
    expect(isManagedLayoutFrame(buildFrame({ layoutMode: LayoutMode.grid }))).toBe(true);
  });

  it('should return false for a plain frame with no layout mode', () => {
    expect(isManagedLayoutFrame(buildFrame({}))).toBe(false);
  });

  it('should return false for a frame with freeForm layout mode', () => {
    expect(isManagedLayoutFrame(buildFrame({ layoutMode: LayoutMode.freeForm }))).toBe(false);
  });

  it('should return false for a non-frame container, like a group', () => {
    const group: TGroupNode = {
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
    };

    expect(isManagedLayoutFrame(group)).toBe(false);
  });
});
