// utils
import { getAutoLayoutOriginalIndex } from '../getAutoLayoutOriginalIndex';

describe('getAutoLayoutOriginalIndex', () => {
  it('should return 0 when the dragged item was the first child', () => {
    expect(getAutoLayoutOriginalIndex(['a', 'b', 'c'], ['a'])).toBe(0);
  });

  it('should return the count of siblings that preceded the dragged item', () => {
    expect(getAutoLayoutOriginalIndex(['a', 'b', 'c'], ['b'])).toBe(1);
  });

  it('should return the list length when the dragged item was the last child', () => {
    expect(getAutoLayoutOriginalIndex(['a', 'b', 'c'], ['c'])).toBe(2);
  });

  it('should ignore the other selected ids in a multi-select drag and anchor on the first one', () => {
    expect(getAutoLayoutOriginalIndex(['a', 'b', 'c', 'd'], ['c', 'd'])).toBe(2);
  });
});
