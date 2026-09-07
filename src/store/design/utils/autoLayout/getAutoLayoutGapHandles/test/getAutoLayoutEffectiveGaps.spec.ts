// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getAutoLayoutEffectiveGaps } from '../getAutoLayoutEffectiveGaps';

const rect = (x: number, y: number, width = 50, height = 50): TRectangleNode => ({
  fill: '#000',
  height,
  id: `rect-${x}-${y}`,
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width,
  x,
  y,
});

const frame = (layoutMode: LayoutMode, overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  horizontalGap: 7,
  id: 'frame-1',
  layoutMode,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  verticalGap: 9,
  width: 300,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getAutoLayoutEffectiveGaps', () => {
  it('should fall back to the stored gap values when the frame is not an auto-layout frame', () => {
    // action
    const gaps = getAutoLayoutEffectiveGaps(frame(LayoutMode.freeForm), [rect(0, 0), rect(70, 0)]);

    // result
    expect(gaps).toEqual({ horizontal: 7, vertical: 9 });
  });

  it('should fall back to the stored gap values for a single child', () => {
    // action
    const gaps = getAutoLayoutEffectiveGaps(frame(LayoutMode.horizontal), [rect(0, 0)]);

    // result
    expect(gaps).toEqual({ horizontal: 7, vertical: 9 });
  });

  it('should read the real within-line gap on the primary axis, for a horizontal frame', () => {
    // action — two children 20px apart (0..50, 70..120)
    const gaps = getAutoLayoutEffectiveGaps(frame(LayoutMode.horizontal), [rect(0, 0), rect(70, 0)]);

    // result
    expect(gaps.horizontal).toBe(20);
  });

  it('should read the real within-line gap on the primary axis, for a vertical frame', () => {
    // action — two children 20px apart (0..50, 70..120)
    const gaps = getAutoLayoutEffectiveGaps(frame(LayoutMode.vertical), [rect(0, 0), rect(0, 70)]);

    // result
    expect(gaps.vertical).toBe(20);
  });

  it('should fall back to the stored counter-axis gap when the frame is not wrapped (a single line)', () => {
    // action
    const gaps = getAutoLayoutEffectiveGaps(frame(LayoutMode.horizontal), [rect(0, 0), rect(70, 0)]);

    // result — only one row exists, so there is no real between-line gap to read
    expect(gaps.vertical).toBe(9);
  });

  it('should default the fallback gaps to 0 when the stored gap fields are unset', () => {
    // action
    const gaps = getAutoLayoutEffectiveGaps(frame(LayoutMode.horizontal, { horizontalGap: undefined, verticalGap: undefined }), [
      rect(0, 0),
    ]);

    // result
    expect(gaps).toEqual({ horizontal: 0, vertical: 0 });
  });

  it('should read the real between-line gap on the counter axis, when wrapped', () => {
    // mock — row 0 has two children (0..120 wide), row 1 wraps a single child 30px below row 0
    const children = [rect(0, 0), rect(70, 0), rect(0, 80)];

    // action
    const gaps = getAutoLayoutEffectiveGaps(frame(LayoutMode.horizontal, { layoutWrap: true }), children);

    // result
    expect(gaps.vertical).toBe(30);
  });
});
