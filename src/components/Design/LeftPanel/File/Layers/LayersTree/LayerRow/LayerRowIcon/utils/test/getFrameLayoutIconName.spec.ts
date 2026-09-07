// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getFrameLayoutIconName } from '../getFrameLayoutIconName';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
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

describe('getFrameLayoutIconName', () => {
  it('should return undefined for a freeForm frame', () => {
    expect(getFrameLayoutIconName(buildFrame())).toBeUndefined();
  });

  it('should return undefined when layoutMode is explicitly freeForm', () => {
    expect(getFrameLayoutIconName(buildFrame({ layoutMode: LayoutMode.freeForm }))).toBeUndefined();
  });

  it('should return LayoutVertical for a vertical frame', () => {
    expect(getFrameLayoutIconName(buildFrame({ layoutMode: LayoutMode.vertical }))).toBe('LayoutVertical');
  });

  it('should return LayoutHorizontal for a horizontal frame without wrap', () => {
    expect(getFrameLayoutIconName(buildFrame({ layoutMode: LayoutMode.horizontal }))).toBe('LayoutHorizontal');
  });

  it('should return LayoutHorizontalWrap for a horizontal frame with wrap', () => {
    expect(getFrameLayoutIconName(buildFrame({ layoutMode: LayoutMode.horizontal, layoutWrap: true }))).toBe('LayoutHorizontalWrap');
  });

  it('should return LayoutGrid for a grid frame', () => {
    expect(getFrameLayoutIconName(buildFrame({ layoutMode: LayoutMode.grid }))).toBe('LayoutGrid');
  });
});
