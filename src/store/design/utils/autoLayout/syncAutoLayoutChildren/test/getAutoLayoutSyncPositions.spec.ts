// types
import { AlignTextBaseline, AlignmentLayout, AutoSpacing, GapMode, LayoutMode, LayoutVersion, NodeType } from 'types/design/enums';
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

  it('should apply the "evenly" auto spacing mode on a horizontal frame’s primary gap, when the gap mode is auto', () => {
    const layoutFrame = frame({ autoSpacing: AutoSpacing.evenly, height: 20, horizontalGapMode: GapMode.auto, width: 200 });
    const sizes = [
      { height: 20, id: 'a', width: 20 },
      { height: 20, id: 'b', width: 20 },
      { height: 20, id: 'c', width: 20 },
    ];

    const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

    // leftover 140 split into (3 items + 1) = 4 equal units of 35
    expect(positions).toEqual([
      { height: 20, id: 'a', width: 20, x: 35, y: 0 },
      { height: 20, id: 'b', width: 20, x: 90, y: 0 },
      { height: 20, id: 'c', width: 20, x: 145, y: 0 },
    ]);
  });

  it('should also apply the auto spacing mode on a vertical frame’s primary gap, when that frame’s gap mode is auto', () => {
    const layoutFrame = frame({ autoSpacing: AutoSpacing.evenly, height: 200, verticalGapMode: GapMode.auto, width: 20 });
    const sizes = [
      { height: 20, id: 'a', width: 20 },
      { height: 20, id: 'b', width: 20 },
      { height: 20, id: 'c', width: 20 },
    ];

    const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.vertical, sizes);

    expect(positions).toEqual([
      { height: 20, id: 'a', width: 20, x: 0, y: 35 },
      { height: 20, id: 'b', width: 20, x: 0, y: 90 },
      { height: 20, id: 'c', width: 20, x: 0, y: 145 },
    ]);
  });

  it('should ignore the auto spacing mode when the gap mode is fixed, not auto', () => {
    const layoutFrame = frame({ autoSpacing: AutoSpacing.evenly, height: 20, horizontalGap: 10, width: 200 });
    const sizes = [
      { height: 20, id: 'a', width: 20 },
      { height: 20, id: 'b', width: 20 },
    ];

    const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

    // fixed 10px gap, packed at the start — the auto spacing mode has no effect since the gap mode isn't auto
    expect(positions).toEqual([
      { height: 20, id: 'a', width: 20, x: 0, y: 0 },
      { height: 20, id: 'b', width: 20, x: 30, y: 0 },
    ]);
  });

  describe('layout version', () => {
    it('should overlap children with a negative auto gap under the legacy layout version', () => {
      const layoutFrame = frame({
        height: 20,
        horizontalGapMode: GapMode.auto,
        layoutVersion: LayoutVersion.legacy,
        width: 50,
      });
      const sizes = [
        { height: 20, id: 'a', width: 40 },
        { height: 20, id: 'b', width: 40 },
      ];

      const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

      // raw leftover 50 - 80 = -30 across the single gap
      expect(positions).toEqual([
        { height: 20, id: 'a', width: 40, x: 0, y: 0 },
        { height: 20, id: 'b', width: 40, x: 10, y: 0 },
      ]);
    });

    it('should collapse children to the start with a clamped auto gap under the updated layout version', () => {
      const layoutFrame = frame({
        height: 20,
        horizontalGapMode: GapMode.auto,
        layoutVersion: LayoutVersion.updated,
        width: 50,
      });
      const sizes = [
        { height: 20, id: 'a', width: 40 },
        { height: 20, id: 'b', width: 40 },
      ];

      const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

      expect(positions).toEqual([
        { height: 20, id: 'a', width: 40, x: 0, y: 0 },
        { height: 20, id: 'b', width: 40, x: 40, y: 0 },
      ]);
    });

    it('should centre a lone child in a "between" auto stack under the legacy layout version', () => {
      const layoutFrame = frame({
        height: 20,
        horizontalGapMode: GapMode.auto,
        layoutVersion: LayoutVersion.legacy,
        width: 200,
      });
      const sizes = [{ height: 20, id: 'a', width: 40 }];

      const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

      // (200 - 40) / 2 = 80
      expect(positions).toEqual([{ height: 20, id: 'a', width: 40, x: 80, y: 0 }]);
    });

    it('should keep a lone child start-aligned in a "between" auto stack under the updated layout version', () => {
      const layoutFrame = frame({
        height: 20,
        horizontalGapMode: GapMode.auto,
        layoutVersion: LayoutVersion.updated,
        width: 200,
      });
      const sizes = [{ height: 20, id: 'a', width: 40 }];

      const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

      expect(positions).toEqual([{ height: 20, id: 'a', width: 40, x: 0, y: 0 }]);
    });

    it('should widen a fixed frame narrower than its padding to the padding width under the updated layout version', () => {
      const layoutFrame = frame({ height: 100, paddingLeft: 30, paddingRight: 30, width: 40 });
      const sizes = [{ height: 20, id: 'a', width: 10 }];

      const positions = getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

      // frame widened 40 -> 60, child sits at the left padding edge
      expect(layoutFrame.width).toBe(60);
      expect(positions).toEqual([{ height: 20, id: 'a', width: 10, x: 30, y: 0 }]);
    });

    it('should leave a fixed frame narrower than its padding untouched under the legacy layout version', () => {
      const layoutFrame = frame({
        height: 100,
        layoutVersion: LayoutVersion.legacy,
        paddingLeft: 30,
        paddingRight: 30,
        width: 40,
      });
      const sizes = [{ height: 20, id: 'a', width: 10 }];

      getAutoLayoutSyncPositions(layoutFrame, LayoutMode.horizontal, sizes);

      expect(layoutFrame.width).toBe(40);
    });
  });
});
