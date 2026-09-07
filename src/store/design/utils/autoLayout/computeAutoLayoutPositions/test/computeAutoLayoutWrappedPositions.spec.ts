// types
import { AlignmentLayout, LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { computeAutoLayoutWrappedPositions } from '../computeAutoLayoutWrappedPositions';

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

describe('computeAutoLayoutWrappedPositions', () => {
  it('should wrap children onto new lines once they overflow the available width', () => {
    const layoutFrame = frame({ width: 50 });
    const sizes = [
      { height: 20, id: 'a', width: 50 },
      { height: 20, id: 'b', width: 50 },
    ];

    const positions = computeAutoLayoutWrappedPositions(
      layoutFrame,
      LayoutMode.horizontal,
      0,
      5,
      AlignmentLayout.topLeft,
      NO_PADDING,
      sizes,
    );

    expect(positions).toEqual([
      { height: 20, id: 'a', width: 50, x: 0, y: 0 },
      { height: 20, id: 'b', width: 50, x: 0, y: 25 },
    ]);
  });

  it('should hug the frame’s counter axis to the wrapped block when the counter axis hugs', () => {
    const layoutFrame = frame({ height: 999, heightSizingMode: SizingMode.hug, width: 50 });
    const sizes = [
      { height: 20, id: 'a', width: 50 },
      { height: 30, id: 'b', width: 50 },
    ];

    computeAutoLayoutWrappedPositions(layoutFrame, LayoutMode.horizontal, 0, 5, AlignmentLayout.topLeft, NO_PADDING, sizes);

    // two lines (20 + 30) plus one 5px gap between them = 55
    expect(layoutFrame.height).toBe(55);
  });

  it('should leave the frame’s counter axis untouched when it is not hugging', () => {
    const layoutFrame = frame({ height: 200, width: 50 });
    const sizes = [
      { height: 20, id: 'a', width: 50 },
      { height: 30, id: 'b', width: 50 },
    ];

    computeAutoLayoutWrappedPositions(layoutFrame, LayoutMode.horizontal, 0, 5, AlignmentLayout.topLeft, NO_PADDING, sizes);

    expect(layoutFrame.height).toBe(200);
  });

  it('should group lines against maxWidth and hug the primary axis to the widest resulting line', () => {
    const layoutFrame = frame({ height: 100, maxWidth: 50, width: 999, widthSizingMode: SizingMode.hug });
    const sizes = [
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 40 },
    ];

    computeAutoLayoutWrappedPositions(layoutFrame, LayoutMode.horizontal, 10, 10, AlignmentLayout.topLeft, NO_PADDING, sizes);

    // grouped against the 50 max (30+10+40=80 would overflow it), so b wraps to its own line;
    // the frame then hugs to the widest resulting line (40), not the raw max
    expect(layoutFrame.width).toBe(40);
  });

  it('should clamp the primary-axis hug size down to maxWidth when even a single line still overflows it', () => {
    const layoutFrame = frame({ height: 100, maxWidth: 25, width: 999, widthSizingMode: SizingMode.hug });
    const sizes = [{ height: 20, id: 'a', width: 30 }];

    computeAutoLayoutWrappedPositions(layoutFrame, LayoutMode.horizontal, 10, 10, AlignmentLayout.topLeft, NO_PADDING, sizes);

    expect(layoutFrame.width).toBe(25);
  });

  it('should grow a filling child within its own wrapped line', () => {
    const layoutFrame = frame({ width: 100 });
    const sizes = [
      { height: 20, id: 'a', width: 100 },
      { height: 20, id: 'b', width: 20, widthSizingMode: SizingMode.fill },
    ];

    const positions = computeAutoLayoutWrappedPositions(
      layoutFrame,
      LayoutMode.horizontal,
      0,
      0,
      AlignmentLayout.topLeft,
      NO_PADDING,
      sizes,
    );

    // 'a' alone fills the first 100-wide line; 'b' wraps to its own line and fills it entirely
    expect(positions[1]).toMatchObject({ width: 100 });
  });
});
