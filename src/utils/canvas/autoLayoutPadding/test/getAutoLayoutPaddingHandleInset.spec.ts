// utils
import { getAutoLayoutPaddingHandleInset } from '../getAutoLayoutPaddingHandleInset';

describe('getAutoLayoutPaddingHandleInset', () => {
  it('should inset by half the padding value when it is positive, centring the handle in the band', () => {
    // result
    expect(getAutoLayoutPaddingHandleInset(30, 100, 30, false)).toBe(15);
  });

  it('should clamp the halved padding value to the max inset', () => {
    // result
    expect(getAutoLayoutPaddingHandleInset(400, 100, 30, false)).toBe(100);
  });

  it('should use the zero-state offset when the padding value is 0', () => {
    // result
    expect(getAutoLayoutPaddingHandleInset(0, 100, 30, false)).toBe(30);
  });

  it('should clamp the zero-state offset to the max inset on a small frame', () => {
    // result
    expect(getAutoLayoutPaddingHandleInset(0, 10, 30, false)).toBe(10);
  });

  it('should sit exactly at 0 while actively dragging, instead of jumping to the zero-state offset', () => {
    // result
    expect(getAutoLayoutPaddingHandleInset(0, 100, 30, true)).toBe(0);
  });
});
