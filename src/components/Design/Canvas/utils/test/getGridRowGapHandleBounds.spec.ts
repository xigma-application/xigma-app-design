// utils
import { getGridRowGapHandleBounds } from '../getGridRowGapHandleBounds';

describe('getGridRowGapHandleBounds', () => {
  it('should inset each end by 80% of that end column width and centre between the insets', () => {
    const gap = { index: 0, midpoint: { x: 90, y: 75 }, span: { x1: 10, x2: 190, y1: 75, y2: 75 }, value: 50 };

    expect(getGridRowGapHandleBounds(gap, 20, 30)).toEqual({ end: 166, midX: 96, start: 26 });
  });

  it('should be symmetric and centred on the span midpoint when both end columns share a width', () => {
    const gap = { index: 0, midpoint: { x: 100, y: 0 }, span: { x1: 0, x2: 200, y1: 0, y2: 0 }, value: 50 };

    expect(getGridRowGapHandleBounds(gap, 50, 50)).toEqual({ end: 160, midX: 100, start: 40 });
  });
});
