// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { applyGridHugSizing, TApplyGridHugSizingInput } from '../applyGridHugSizing';

const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

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

const run = (frameNode: TFrameNode, overrides: Partial<TApplyGridHugSizingInput> = {}): void =>
  applyGridHugSizing({
    columnCount: 2,
    columnGap: 0,
    columnTrackSizes: [30, 50],
    frame: frameNode,
    isHeightHug: false,
    isWidthHug: false,
    padding: NO_PADDING,
    rowCount: 2,
    rowGap: 0,
    rowTrackSizes: [20, 40],
    ...overrides,
  });

describe('applyGridHugSizing behaviors', () => {
  it('should leave the frame untouched when neither axis hugs', () => {
    // mock
    const layoutFrame = frame({ height: 999, width: 999 });

    // before
    run(layoutFrame);

    // result
    expect(layoutFrame).toMatchObject({ height: 999, width: 999 });
  });

  it('should grow a width-hug frame to the column tracks, gaps and horizontal padding', () => {
    // mock
    const layoutFrame = frame({ width: 999 });

    // before
    run(layoutFrame, {
      columnGap: 10,
      isWidthHug: true,
      padding: { paddingBottom: 0, paddingLeft: 5, paddingRight: 5, paddingTop: 0 },
    });

    // result
    expect(layoutFrame.width).toBe(5 + 5 + 30 + 50 + 10);
  });

  it('should grow a height-hug frame to the row tracks, gaps and vertical padding', () => {
    // mock
    const layoutFrame = frame({ height: 999 });

    // before
    run(layoutFrame, {
      isHeightHug: true,
      padding: { paddingBottom: 4, paddingLeft: 0, paddingRight: 0, paddingTop: 6 },
      rowGap: 8,
    });

    // result
    expect(layoutFrame.height).toBe(6 + 4 + 20 + 40 + 8);
  });

  it('should clamp a hugged size to the frame min and max bounds', () => {
    // mock
    const layoutFrame = frame({ maxWidth: 40, minHeight: 500 });

    // before
    run(layoutFrame, { isHeightHug: true, isWidthHug: true });

    // result
    expect(layoutFrame).toMatchObject({ height: 500, width: 40 });
  });
});
