// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { buildAutoLayoutWrapLines } from '../buildAutoLayoutWrapLines';

const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 999,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 999,
  x: 0,
  y: 0,
  ...overrides,
});

describe('buildAutoLayoutWrapLines', () => {
  it('should group children into lines based on the available primary space', () => {
    const layoutFrame = frame();
    const sizes = [
      { height: 20, id: 'a', width: 50 },
      { height: 20, id: 'b', width: 50 },
    ];

    const lines = buildAutoLayoutWrapLines(
      layoutFrame,
      LayoutMode.horizontal,
      0,
      0,
      NO_PADDING,
      sizes,
      SizingMode.fixed,
      SizingMode.fixed,
      50,
    );

    expect(lines).toEqual([[sizes[0]], [sizes[1]]]);
  });

  it('should apply the primary hug size to the frame when the primary mode hugs', () => {
    const layoutFrame = frame({ width: 999 });
    const sizes = [{ height: 10, id: 'a', width: 30 }];

    buildAutoLayoutWrapLines(layoutFrame, LayoutMode.horizontal, 0, 0, NO_PADDING, sizes, SizingMode.hug, SizingMode.fixed, 999);

    expect(layoutFrame.width).toBe(30);
  });

  it('should apply the counter hug size to the frame when the counter mode hugs', () => {
    const layoutFrame = frame({ height: 999 });
    const sizes = [{ height: 20, id: 'a', width: 30 }];

    buildAutoLayoutWrapLines(layoutFrame, LayoutMode.horizontal, 0, 5, NO_PADDING, sizes, SizingMode.fixed, SizingMode.hug, 999);

    expect(layoutFrame.height).toBe(20);
  });

  it('should leave the frame’s width and height untouched when neither mode hugs', () => {
    const layoutFrame = frame({ height: 999, width: 999 });
    const sizes = [{ height: 20, id: 'a', width: 30 }];

    buildAutoLayoutWrapLines(layoutFrame, LayoutMode.horizontal, 0, 0, NO_PADDING, sizes, SizingMode.fixed, SizingMode.fixed, 999);

    expect(layoutFrame.width).toBe(999);
    expect(layoutFrame.height).toBe(999);
  });
});
