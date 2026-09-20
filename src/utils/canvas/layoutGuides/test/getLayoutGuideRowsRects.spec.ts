// types
import { LayoutGuideRowsAlign, LayoutGuideType, NodeType } from 'types/design/enums';
import { TFrameNode, TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideRowsRects } from '../getLayoutGuideRowsRects';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [],
  height: 200,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 50,
  x: 0,
  y: 0,
  ...overrides,
});

const guide = (overrides: Partial<TLayoutGuide> = {}): TLayoutGuide => ({
  color: '#FF0000',
  count: 4,
  gutter: 20,
  margin: 0,
  opacity: 10,
  rowsAlign: LayoutGuideRowsAlign.stretch,
  type: LayoutGuideType.rows,
  ...overrides,
});

describe('getLayoutGuideRowsRects', () => {
  it('should split the available height evenly across the rows when stretched', () => {
    // action — (200 - 3*20) / 4 = 35 tall rows
    const rects = getLayoutGuideRowsRects(guide(), buildFrame());

    // result
    expect(rects).toEqual([
      { fill: '#FF0000', fillAlpha: 0.1, height: 35, width: 50, x: 0, y: 0 },
      { fill: '#FF0000', fillAlpha: 0.1, height: 35, width: 50, x: 0, y: 55 },
      { fill: '#FF0000', fillAlpha: 0.1, height: 35, width: 50, x: 0, y: 110 },
      { fill: '#FF0000', fillAlpha: 0.1, height: 35, width: 50, x: 0, y: 165 },
    ]);
  });

  it('should anchor a fixed-height row set to the bottom edge, before the margin', () => {
    // action — total = 4*30 + 3*20 = 180, start = 200 - 10 - 180 = 10
    const rects = getLayoutGuideRowsRects(guide({ height: 30, margin: 10, rowsAlign: LayoutGuideRowsAlign.bottom }), buildFrame());

    // result
    expect(rects[0].y).toBe(10);
    expect(rects[3].y).toBe(10 + 3 * (30 + 20));
  });

  it('should center a fixed-height row set within the frame', () => {
    // action — total = 4*30 + 3*20 = 180, start = (200 - 180) / 2 = 10
    const rects = getLayoutGuideRowsRects(guide({ height: 30, rowsAlign: LayoutGuideRowsAlign.center }), buildFrame());

    // result
    expect(rects[0].y).toBe(10);
  });
});
