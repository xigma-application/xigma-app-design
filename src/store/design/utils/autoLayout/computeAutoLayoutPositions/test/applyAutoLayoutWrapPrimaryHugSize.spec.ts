// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { applyAutoLayoutWrapPrimaryHugSize } from '../applyAutoLayoutWrapPrimaryHugSize';

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

const lines = [[{ height: 10, id: 'a', width: 30 }], [{ height: 10, id: 'b', width: 80 }]];

describe('applyAutoLayoutWrapPrimaryHugSize', () => {
  it('should hug the frame width to the widest line, horizontal', () => {
    const layoutFrame = frame({ width: 999 });

    applyAutoLayoutWrapPrimaryHugSize(layoutFrame, LayoutMode.horizontal, 10, NO_PADDING, lines);

    expect(layoutFrame.width).toBe(80);
  });

  it('should clamp the hugged width down to maxWidth', () => {
    const layoutFrame = frame({ maxWidth: 50, width: 999 });

    applyAutoLayoutWrapPrimaryHugSize(layoutFrame, LayoutMode.horizontal, 10, NO_PADDING, lines);

    expect(layoutFrame.width).toBe(50);
  });

  it('should clamp the hugged width up to minWidth', () => {
    const layoutFrame = frame({ minWidth: 200, width: 999 });

    applyAutoLayoutWrapPrimaryHugSize(layoutFrame, LayoutMode.horizontal, 10, NO_PADDING, lines);

    expect(layoutFrame.width).toBe(200);
  });

  it('should hug the frame height to the tallest line, vertical', () => {
    const verticalLines = [[{ height: 30, id: 'a', width: 10 }], [{ height: 80, id: 'b', width: 10 }]];
    const layoutFrame = frame({ height: 999 });

    applyAutoLayoutWrapPrimaryHugSize(layoutFrame, LayoutMode.vertical, 10, NO_PADDING, verticalLines);

    expect(layoutFrame.height).toBe(80);
  });
});
