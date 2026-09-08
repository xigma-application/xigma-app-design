// utils
import { getAutoLayoutPaddingKey } from '../getAutoLayoutPaddingKey';

describe('getAutoLayoutPaddingKey', () => {
  it('should map each side to its frame padding field', () => {
    // result
    expect(getAutoLayoutPaddingKey('bottom')).toBe('paddingBottom');
    expect(getAutoLayoutPaddingKey('left')).toBe('paddingLeft');
    expect(getAutoLayoutPaddingKey('right')).toBe('paddingRight');
    expect(getAutoLayoutPaddingKey('top')).toBe('paddingTop');
  });
});
