// utils
import { getAutoLayoutPaddingHandleCenter } from '../getAutoLayoutPaddingHandleCenter';

const frame = { height: 200, width: 300, x: 10, y: 20 };

describe('getAutoLayoutPaddingHandleCenter', () => {
  it('should place the left handle inset from the left edge, vertically centred', () => {
    // result
    expect(getAutoLayoutPaddingHandleCenter(frame, 'left', 15)).toEqual({ x: 25, y: 120 });
  });

  it('should place the right handle inset from the right edge, vertically centred', () => {
    // result
    expect(getAutoLayoutPaddingHandleCenter(frame, 'right', 15)).toEqual({ x: 295, y: 120 });
  });

  it('should place the top handle inset from the top edge, horizontally centred', () => {
    // result
    expect(getAutoLayoutPaddingHandleCenter(frame, 'top', 15)).toEqual({ x: 160, y: 35 });
  });

  it('should place the bottom handle inset from the bottom edge, horizontally centred', () => {
    // result
    expect(getAutoLayoutPaddingHandleCenter(frame, 'bottom', 15)).toEqual({ x: 160, y: 205 });
  });
});
