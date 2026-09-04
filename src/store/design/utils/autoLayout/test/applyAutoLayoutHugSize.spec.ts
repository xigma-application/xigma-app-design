// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { applyAutoLayoutHugSize } from '../applyAutoLayoutHugSize';

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

const sizes = [
  { height: 20, id: 'a', width: 30 },
  { height: 50, id: 'b', width: 40 },
];

describe('applyAutoLayoutHugSize', () => {
  it('should hug both width and height when both axes are set to hug, on a horizontal frame', () => {
    const layoutFrame = frame({ counterAxisSizingMode: SizingMode.hug, primaryAxisSizingMode: SizingMode.hug });

    applyAutoLayoutHugSize(layoutFrame, LayoutMode.horizontal, 10, NO_PADDING, sizes);

    expect(layoutFrame).toMatchObject({ height: 50, width: 80 });
  });

  it('should hug only the width (primary axis) on a horizontal frame, leaving height untouched', () => {
    const layoutFrame = frame({ height: 200, primaryAxisSizingMode: SizingMode.hug });

    applyAutoLayoutHugSize(layoutFrame, LayoutMode.horizontal, 10, NO_PADDING, sizes);

    expect(layoutFrame).toMatchObject({ height: 200, width: 80 });
  });

  it('should hug only the height (counter axis) on a horizontal frame, leaving width untouched', () => {
    const layoutFrame = frame({ counterAxisSizingMode: SizingMode.hug, width: 500 });

    applyAutoLayoutHugSize(layoutFrame, LayoutMode.horizontal, 10, NO_PADDING, sizes);

    expect(layoutFrame).toMatchObject({ height: 50, width: 500 });
  });

  it('should hug the height (primary axis) on a vertical frame', () => {
    const layoutFrame = frame({ primaryAxisSizingMode: SizingMode.hug, width: 500 });

    applyAutoLayoutHugSize(layoutFrame, LayoutMode.vertical, 10, NO_PADDING, sizes);

    expect(layoutFrame).toMatchObject({ height: 80, width: 500 });
  });

  it('should leave the frame untouched when both axes are fixed', () => {
    const layoutFrame = frame({ height: 200, width: 500 });

    applyAutoLayoutHugSize(layoutFrame, LayoutMode.horizontal, 10, NO_PADDING, sizes);

    expect(layoutFrame).toMatchObject({ height: 200, width: 500 });
  });
});
