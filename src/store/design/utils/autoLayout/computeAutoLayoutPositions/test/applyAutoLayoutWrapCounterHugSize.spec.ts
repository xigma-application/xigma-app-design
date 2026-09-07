// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { applyAutoLayoutWrapCounterHugSize } from '../applyAutoLayoutWrapCounterHugSize';

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

describe('applyAutoLayoutWrapCounterHugSize', () => {
  it('should hug the frame height to the wrapped block, for a horizontal frame', () => {
    const layoutFrame = frame();
    const lines = [[{ height: 20, id: 'a', width: 30 }], [{ height: 30, id: 'b', width: 30 }]];

    applyAutoLayoutWrapCounterHugSize(layoutFrame, LayoutMode.horizontal, 5, NO_PADDING, lines);

    // two lines (20 + 30) plus one 5px gap between them = 55
    expect(layoutFrame.height).toBe(55);
    expect(layoutFrame.width).toBe(999);
  });

  it('should hug the frame width to the wrapped block, for a vertical frame', () => {
    const layoutFrame = frame();
    const lines = [[{ height: 30, id: 'a', width: 20 }], [{ height: 30, id: 'b', width: 30 }]];

    applyAutoLayoutWrapCounterHugSize(layoutFrame, LayoutMode.vertical, 5, NO_PADDING, lines);

    // two columns (20 + 30) plus one 5px gap between them = 55
    expect(layoutFrame.width).toBe(55);
    expect(layoutFrame.height).toBe(999);
  });
});
