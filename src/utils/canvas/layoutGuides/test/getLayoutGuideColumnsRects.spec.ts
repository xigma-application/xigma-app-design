// types
import { LayoutGuideColumnsAlign, LayoutGuideType, NodeType } from 'types/design/enums';
import { TFrameNode, TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideColumnsRects } from '../getLayoutGuideColumnsRects';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [],
  height: 50,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const guide = (overrides: Partial<TLayoutGuide> = {}): TLayoutGuide => ({
  color: '#FF0000',
  columnsAlign: LayoutGuideColumnsAlign.stretch,
  count: 4,
  gutter: 20,
  margin: 0,
  opacity: 10,
  type: LayoutGuideType.columns,
  ...overrides,
});

describe('getLayoutGuideColumnsRects', () => {
  it('should split the available width evenly across the columns when stretched', () => {
    // action — (200 - 3*20) / 4 = 35 wide columns
    const rects = getLayoutGuideColumnsRects(guide(), buildFrame());

    // result
    expect(rects).toEqual([
      { fill: '#FF0000', fillAlpha: 0.1, height: 50, width: 35, x: 0, y: 0 },
      { fill: '#FF0000', fillAlpha: 0.1, height: 50, width: 35, x: 55, y: 0 },
      { fill: '#FF0000', fillAlpha: 0.1, height: 50, width: 35, x: 110, y: 0 },
      { fill: '#FF0000', fillAlpha: 0.1, height: 50, width: 35, x: 165, y: 0 },
    ]);
  });

  it('should subtract the margin from both edges when stretched', () => {
    // action
    const rects = getLayoutGuideColumnsRects(guide({ margin: 10 }), buildFrame());

    // result — available = 200 - 20 = 180, column = (180 - 60) / 4 = 30, starting at margin
    expect(rects[0]).toEqual({ fill: '#FF0000', fillAlpha: 0.1, height: 50, width: 30, x: 10, y: 0 });
  });

  it('should anchor a fixed-width column set to the left edge, after the margin', () => {
    // action
    const rects = getLayoutGuideColumnsRects(guide({ columnsAlign: LayoutGuideColumnsAlign.left, margin: 10, width: 40 }), buildFrame());

    // result
    expect(rects[0]).toEqual({ fill: '#FF0000', fillAlpha: 0.1, height: 50, width: 40, x: 10, y: 0 });
    expect(rects[1].x).toBe(10 + 40 + 20);
  });

  it('should anchor a fixed-width column set to the right edge, before the margin', () => {
    // action — total = 4*40 + 3*20 = 220, but frame is only 200 wide so this pushes past the left edge on purpose
    const rects = getLayoutGuideColumnsRects(guide({ columnsAlign: LayoutGuideColumnsAlign.right, margin: 10, width: 30 }), buildFrame());

    // result — total = 4*30 + 3*20 = 180, start = 200 - 10 - 180 = 10
    expect(rects[0].x).toBe(10);
    expect(rects[3].x).toBe(10 + 3 * (30 + 20));
  });

  it('should center a fixed-width column set within the frame', () => {
    // action — total = 4*30 + 3*20 = 180, start = (200 - 180) / 2 = 10
    const rects = getLayoutGuideColumnsRects(guide({ columnsAlign: LayoutGuideColumnsAlign.center, width: 30 }), buildFrame());

    // result
    expect(rects[0].x).toBe(10);
  });
});
