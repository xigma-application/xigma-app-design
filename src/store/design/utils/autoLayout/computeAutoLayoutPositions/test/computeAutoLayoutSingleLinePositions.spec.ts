// types
import { AlignmentLayout, LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { computeAutoLayoutSingleLinePositions } from '../computeAutoLayoutSingleLinePositions';

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

describe('computeAutoLayoutSingleLinePositions', () => {
  it('should pack fixed-size children flush from the content-box origin', () => {
    const layoutFrame = frame({ width: 200 });
    const sizes = [
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 40 },
    ];

    const positions = computeAutoLayoutSingleLinePositions(
      layoutFrame,
      LayoutMode.horizontal,
      10,
      AlignmentLayout.topLeft,
      NO_PADDING,
      sizes,
      false,
    );

    expect(positions).toEqual([
      { height: 20, id: 'a', width: 30, x: 0, y: 0 },
      { height: 20, id: 'b', width: 40, x: 40, y: 0 },
    ]);
  });

  it('should hug the frame to its content before packing', () => {
    const layoutFrame = frame({ height: 999, heightSizingMode: SizingMode.hug, width: 999, widthSizingMode: SizingMode.hug });
    const sizes = [
      { height: 20, id: 'a', width: 30 },
      { height: 50, id: 'b', width: 40 },
    ];

    computeAutoLayoutSingleLinePositions(layoutFrame, LayoutMode.horizontal, 10, AlignmentLayout.topLeft, NO_PADDING, sizes, false);

    expect(layoutFrame).toMatchObject({ height: 50, width: 80 });
  });

  it('should grow a filling child into the leftover space, after any hug is resolved', () => {
    const layoutFrame = frame({ width: 300 });
    const sizes = [
      { height: 20, id: 'a', width: 50 },
      { height: 20, id: 'b', width: 20, widthSizingMode: SizingMode.fill },
    ];

    const positions = computeAutoLayoutSingleLinePositions(
      layoutFrame,
      LayoutMode.horizontal,
      10,
      AlignmentLayout.topLeft,
      NO_PADDING,
      sizes,
      false,
    );

    expect(positions[1]).toMatchObject({ width: 240 });
  });

  it('should swap the primary/counter content-box axes, for a vertical frame', () => {
    const layoutFrame = frame({ height: 200, width: 100 });
    const sizes = [
      { height: 30, id: 'a', width: 20 },
      { height: 40, id: 'b', width: 20 },
    ];

    const positions = computeAutoLayoutSingleLinePositions(
      layoutFrame,
      LayoutMode.vertical,
      10,
      AlignmentLayout.topLeft,
      NO_PADDING,
      sizes,
      false,
    );

    expect(positions).toEqual([
      { height: 30, id: 'a', width: 20, x: 0, y: 0 },
      { height: 40, id: 'b', width: 20, x: 0, y: 40 },
    ]);
  });

  it('should distribute the gap evenly across the content box when the primary axis gap is auto', () => {
    const layoutFrame = frame({ width: 200 });
    const sizes = [
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 40 },
      { height: 20, id: 'c', width: 10 },
    ];

    const positions = computeAutoLayoutSingleLinePositions(
      layoutFrame,
      LayoutMode.horizontal,
      10,
      AlignmentLayout.center,
      NO_PADDING,
      sizes,
      true,
    );

    expect(positions).toEqual([
      { height: 20, id: 'a', width: 30, x: 0, y: 40 },
      { height: 20, id: 'b', width: 40, x: 90, y: 40 },
      { height: 20, id: 'c', width: 10, x: 190, y: 40 },
    ]);
  });
});
