// utils
import { getBackgroundBlurCacheKey } from '../getBackgroundBlurCacheKey';

describe('getBackgroundBlurCacheKey', () => {
  it('should keep a background blur entry apart from a glass entry of the same node', () => {
    // result
    expect(getBackgroundBlurCacheKey('n1')).toBe('n1:backgroundBlur');
    expect(getBackgroundBlurCacheKey('n1')).not.toBe('n1');
  });
});
