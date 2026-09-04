// types
import { AlignmentLayout, LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { computeAutoLayoutPositions } from '../computeAutoLayoutPositions';

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

describe('computeAutoLayoutPositions', () => {
  it('should use the plain single-line engine when wrap is off', () => {
    const layoutFrame = frame({ width: 200 });
    const sizes = [
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 40 },
    ];

    const positions = computeAutoLayoutPositions(layoutFrame, LayoutMode.horizontal, 10, 10, AlignmentLayout.topLeft, NO_PADDING, sizes);

    expect(positions).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 40, y: 0 },
    ]);
  });

  it('should switch to the wrapped engine when layoutWrap is set', () => {
    const layoutFrame = frame({ layoutWrap: true, width: 50 });
    const sizes = [
      { height: 20, id: 'a', width: 50 },
      { height: 20, id: 'b', width: 50 },
    ];

    const positions = computeAutoLayoutPositions(layoutFrame, LayoutMode.horizontal, 0, 5, AlignmentLayout.topLeft, NO_PADDING, sizes);

    expect(positions).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 0, y: 25 },
    ]);
  });

  it('should ignore layoutWrap when the primary axis itself hugs — there is no fixed width to wrap against', () => {
    const layoutFrame = frame({ height: 999, layoutWrap: true, primaryAxisSizingMode: SizingMode.hug, width: 999 });
    const sizes = [
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 40 },
    ];

    const positions = computeAutoLayoutPositions(layoutFrame, LayoutMode.horizontal, 10, 10, AlignmentLayout.topLeft, NO_PADDING, sizes);

    // hugged to a single line (30+10+40=80), not wrapped
    expect(layoutFrame.width).toBe(80);
    expect(positions).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 40, y: 0 },
    ]);
  });

  it('should hug the counter axis to the wrapped block, when wrap is on and the counter axis hugs', () => {
    const layoutFrame = frame({ counterAxisSizingMode: SizingMode.hug, height: 999, layoutWrap: true, width: 50 });
    const sizes = [
      { height: 20, id: 'a', width: 50 },
      { height: 30, id: 'b', width: 50 },
    ];

    computeAutoLayoutPositions(layoutFrame, LayoutMode.horizontal, 0, 5, AlignmentLayout.topLeft, NO_PADDING, sizes);

    // two lines (20 + 30) plus one 5px gap between them = 55
    expect(layoutFrame.height).toBe(55);
  });

  it('should hug the counter axis (width) to the wrapped block, for a vertical frame', () => {
    const layoutFrame = frame({ counterAxisSizingMode: SizingMode.hug, height: 50, layoutWrap: true, width: 999 });
    const sizes = [
      { height: 50, id: 'a', width: 20 },
      { height: 50, id: 'b', width: 30 },
    ];

    computeAutoLayoutPositions(layoutFrame, LayoutMode.vertical, 0, 5, AlignmentLayout.topLeft, NO_PADDING, sizes);

    // two columns (20 + 30) plus one 5px gap between them = 55
    expect(layoutFrame.width).toBe(55);
  });
});
