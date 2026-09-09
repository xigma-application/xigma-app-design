// types
import { AlignTextBaseline, AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutSyncPositions } from '../getAutoLayoutSyncPositions';
import { getTextBaselineOffset } from '../../getTextBaselineOffset';

const frame = (overrides: Partial<TFrameNode>): TFrameNode => ({
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

describe('getAutoLayoutSyncPositions', () => {
  it('should lay children out left to right using the frame’s own gap and padding, horizontal', () => {
    const layoutFrame = frame({ horizontalGap: 10, paddingLeft: 5, paddingTop: 5, width: 200, x: 100, y: 200 });
    const sizes = [
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 40 },
    ];

    const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

    expect(positions).toEqual([
      { height: 20, id: 'a', width: 30, x: 105, y: 205 },
      { height: 20, id: 'b', width: 40, x: 145, y: 205 },
    ]);
  });

  it('should default a missing verticalGap (counter axis, horizontal) to the itemSpacing', () => {
    const layoutFrame = frame({ height: 100, layoutWrap: true, verticalGap: undefined, width: 50 });
    const sizes = [
      { height: 20, id: 'a', width: 50 },
      { height: 20, id: 'b', width: 50 },
    ];

    const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

    // no horizontalGap set either, so both item spacing and the wrapped-line gap default to 0
    expect(positions).toEqual([
      { height: 20, id: 'a', width: 50, x: 0, y: 0 },
      { height: 20, id: 'b', width: 50, x: 0, y: 20 },
    ]);
  });

  it('should default a missing layoutAlignment to topLeft', () => {
    const layoutFrame = frame({ height: 100, width: 200 });
    const sizes = [{ height: 20, id: 'a', width: 30 }];

    const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

    expect(positions).toEqual([{ height: 20, id: 'a', width: 30, x: 0, y: 0 }]);
  });

  it('should centre children on the counter axis when layoutAlignment is set', () => {
    const layoutFrame = frame({ height: 100, layoutAlignment: AlignmentLayout.left, width: 200 });
    const sizes = [{ height: 20, id: 'a', width: 30 }];

    const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

    // vertically centred: (100-20)/2 = 40
    expect(positions).toEqual([{ height: 20, id: 'a', width: 30, x: 0, y: 40 }]);
  });

  it('should swap the primary/counter gaps for a vertical frame', () => {
    const layoutFrame = frame({ height: 200, verticalGap: 10, width: 100 });
    const sizes = [
      { height: 30, id: 'a', width: 20 },
      { height: 40, id: 'b', width: 20 },
    ];

    const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.vertical, sizes);

    expect(positions).toEqual([
      { height: 30, id: 'a', width: 20, x: 0, y: 0 },
      { height: 40, id: 'b', width: 20, x: 0, y: 40 },
    ]);
  });

  it('should align by text baseline instead of layoutAlignment, on a horizontal frame, when enabled', () => {
    const layoutFrame = frame({
      alignTextBaseline: AlignTextBaseline.on,
      height: 100,
      layoutAlignment: AlignmentLayout.left,
      width: 200,
    });
    const sizes = [
      { fontSize: 16, height: 20, id: 'text', width: 50 },
      { height: 30, id: 'icon', width: 24 },
    ];

    const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

    // if layoutAlignment ("left") were still in effect, both would centre at (100-height)/2; instead
    // both baselines land on the icon's own baseline (its bottom edge, the taller offset)
    const textBaselineOffset = getTextBaselineOffset(16);

    expect(positions).toEqual([
      { height: 20, id: 'text', width: 50, x: 0, y: 30 - textBaselineOffset },
      { height: 30, id: 'icon', width: 24, x: 50, y: 0 },
    ]);
  });

  it('should ignore alignTextBaseline on a vertical frame, since baseline alignment is horizontal-only', () => {
    const layoutFrame = frame({
      alignTextBaseline: AlignTextBaseline.on,
      height: 200,
      layoutAlignment: AlignmentLayout.center,
      width: 100,
    });
    const sizes = [{ fontSize: 16, height: 20, id: 'text', width: 50 }];

    const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.vertical, sizes);

    // falls back to the normal layoutAlignment math: counter (x) centred (100-50)/2=25, primary (y) centred (200-20)/2=90
    expect(positions).toEqual([{ height: 20, id: 'text', width: 50, x: 25, y: 90 }]);
  });
});
