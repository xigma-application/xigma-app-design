// utils
import { getThumbOffset } from '../getThumbOffset';

describe('getThumbOffset', () => {
  it('should place the thumb along the track, inset by its radius on both ends', () => {
    // result
    expect(getThumbOffset(0.25, 6)).toBe('calc(6px + 0.25 * (100% - 12px))');
  });
});
