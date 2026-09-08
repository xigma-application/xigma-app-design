// utils
import { getAutoLayoutPaddingIconName } from '../getAutoLayoutPaddingIconName';

describe('getAutoLayoutPaddingIconName', () => {
  it('should return the bottom padding icon', () => {
    expect(getAutoLayoutPaddingIconName('bottom')).toBe('PaddingB');
  });

  it('should return the left padding icon', () => {
    expect(getAutoLayoutPaddingIconName('left')).toBe('PaddingL');
  });

  it('should return the right padding icon', () => {
    expect(getAutoLayoutPaddingIconName('right')).toBe('PaddingR');
  });

  it('should return the top padding icon', () => {
    expect(getAutoLayoutPaddingIconName('top')).toBe('PaddingT');
  });
});
