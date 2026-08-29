// utils
import { getReorderedIndex } from '../getReorderedIndex';

describe('getReorderedIndex', () => {
  it('should shift the insertion index back by one when moving an item forward', () => {
    // action & result
    expect(getReorderedIndex(0, 3)).toBe(2);
  });

  it('should keep the insertion index as-is when moving an item backward', () => {
    // action & result
    expect(getReorderedIndex(3, 1)).toBe(1);
  });

  it('should return the original index when the insertion index equals it', () => {
    // action & result
    expect(getReorderedIndex(2, 2)).toBe(2);
  });
});
