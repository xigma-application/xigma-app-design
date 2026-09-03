// others
import { SCROLLBAR_RANGE_PADDING_PX } from '../../../constants';

// utils
import { getScrollRange } from '../getScrollRange';

describe('getScrollRange', () => {
  it("should pad the visible rect when content is fully within it (range can't shrink below the view)", () => {
    // mock
    const contentBoundsWorld = { height: 100, width: 100, x: 0, y: 0 };
    const viewport = { x: 0, y: 0, zoom: 1 };
    const visibleRect = { height: 600, width: 800, x: 0, y: 0 };

    // before
    const range = getScrollRange(contentBoundsWorld, viewport, visibleRect);

    // result
    expect(range).toEqual({
      height: 600 + SCROLLBAR_RANGE_PADDING_PX * 2,
      width: 800 + SCROLLBAR_RANGE_PADDING_PX * 2,
      x: 0 - SCROLLBAR_RANGE_PADDING_PX,
      y: 0 - SCROLLBAR_RANGE_PADDING_PX,
    });
  });

  it('should extend the range to reach content sitting outside the current view', () => {
    // mock
    const contentBoundsWorld = { height: 100, width: 100, x: 1000, y: 0 };
    const viewport = { x: 0, y: 0, zoom: 1 };
    const visibleRect = { height: 600, width: 800, x: 0, y: 0 };

    // before
    const range = getScrollRange(contentBoundsWorld, viewport, visibleRect);

    // result
    expect(range).toEqual({
      height: 600 + SCROLLBAR_RANGE_PADDING_PX * 2,
      width: 1100 + SCROLLBAR_RANGE_PADDING_PX * 2,
      x: 0 - SCROLLBAR_RANGE_PADDING_PX,
      y: 0 - SCROLLBAR_RANGE_PADDING_PX,
    });
  });

  it('should scale content bounds to screen space by the current zoom', () => {
    // mock
    const contentBoundsWorld = { height: 100, width: 100, x: 0, y: 0 };
    const viewport = { x: 0, y: 0, zoom: 2 };
    const visibleRect = { height: 100, width: 100, x: 0, y: 0 };

    // before
    const range = getScrollRange(contentBoundsWorld, viewport, visibleRect);

    // result — content becomes 200x200 on screen, dwarfing the 100x100 view
    expect(range).toEqual({
      height: 200 + SCROLLBAR_RANGE_PADDING_PX * 2,
      width: 200 + SCROLLBAR_RANGE_PADDING_PX * 2,
      x: 0 - SCROLLBAR_RANGE_PADDING_PX,
      y: 0 - SCROLLBAR_RANGE_PADDING_PX,
    });
  });

  it('should offset content bounds to screen space by the current viewport pan', () => {
    // mock
    const contentBoundsWorld = { height: 100, width: 100, x: 0, y: 0 };
    const viewport = { x: 50, y: 20, zoom: 1 };
    const visibleRect = { height: 600, width: 800, x: 0, y: 0 };

    // before
    const range = getScrollRange(contentBoundsWorld, viewport, visibleRect);

    // result — content (now at screen 50,20) is still fully within the visible rect, so it's a no-op
    expect(range).toEqual({
      height: 600 + SCROLLBAR_RANGE_PADDING_PX * 2,
      width: 800 + SCROLLBAR_RANGE_PADDING_PX * 2,
      x: 0 - SCROLLBAR_RANGE_PADDING_PX,
      y: 0 - SCROLLBAR_RANGE_PADDING_PX,
    });
  });
});
