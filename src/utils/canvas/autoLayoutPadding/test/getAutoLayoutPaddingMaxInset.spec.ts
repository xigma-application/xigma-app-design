// utils
import { getAutoLayoutPaddingMaxInset } from '../getAutoLayoutPaddingMaxInset';

const frame = { height: 200, width: 300, x: 0, y: 0 };

describe('getAutoLayoutPaddingMaxInset', () => {
  it('should cap left at half the frame width', () => {
    // result
    expect(getAutoLayoutPaddingMaxInset(frame, 'left')).toBe(150);
  });

  it('should cap right at half the frame width', () => {
    // result
    expect(getAutoLayoutPaddingMaxInset(frame, 'right')).toBe(150);
  });

  it('should cap top at half the frame height', () => {
    // result
    expect(getAutoLayoutPaddingMaxInset(frame, 'top')).toBe(100);
  });

  it('should cap bottom at half the frame height', () => {
    // result
    expect(getAutoLayoutPaddingMaxInset(frame, 'bottom')).toBe(100);
  });
});
