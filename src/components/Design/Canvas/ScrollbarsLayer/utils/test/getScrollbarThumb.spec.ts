// utils
import { getScrollbarThumb } from '../getScrollbarThumb';

describe('getScrollbarThumb', () => {
  it('should fill the whole track when the visible view covers the entire scroll range', () => {
    // before
    const thumb = getScrollbarThumb(100, 0, 50, 0, 50);

    // result
    expect(thumb).toEqual({ offset: 0, size: 100 });
  });

  it('should shrink the thumb proportionally when the scroll range is larger than the view', () => {
    // before
    const thumb = getScrollbarThumb(1000, 0, 50, 0, 200);

    // result
    expect(thumb).toEqual({ offset: 0, size: 250 });
  });

  it("should move the thumb along the track as the view's offset moves within the range", () => {
    // before
    const thumb = getScrollbarThumb(1000, 50, 50, 0, 200);

    // result
    expect(thumb).toEqual({ offset: 250, size: 250 });
  });

  it('should clamp the thumb to a minimum size instead of shrinking to near-nothing on a huge range', () => {
    // before
    const thumb = getScrollbarThumb(100, 0, 10, 0, 10000);

    // result
    expect(thumb).toEqual({ offset: 0, size: 32 });
  });

  it('should never let the minimum thumb size exceed a track shorter than that minimum', () => {
    // before
    const thumb = getScrollbarThumb(20, 0, 5, 0, 1000);

    // result
    expect(thumb).toEqual({ offset: 0, size: 20 });
  });

  it('should clamp the thumb offset so it never runs past the end of the track', () => {
    // before
    const thumb = getScrollbarThumb(1000, 190, 50, 0, 200);

    // result
    expect(thumb).toEqual({ offset: 750, size: 250 });
  });
});
