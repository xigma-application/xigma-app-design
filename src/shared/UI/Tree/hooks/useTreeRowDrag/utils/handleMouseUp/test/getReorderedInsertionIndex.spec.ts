// utils
import { getReorderedInsertionIndex } from '../getReorderedInsertionIndex';

describe('getReorderedInsertionIndex', () => {
  it('should shift the insertion index back by one when moving an item forward', () => {
    // action & result
    expect(getReorderedInsertionIndex([0], 3)).toBe(2);
  });

  it('should keep the insertion index as-is when moving an item backward', () => {
    // action & result
    expect(getReorderedInsertionIndex([3], 1)).toBe(1);
  });

  it('should return the original index when the insertion index equals it', () => {
    // action & result
    expect(getReorderedInsertionIndex([2], 2)).toBe(2);
  });

  it('should shift the insertion index back by the count of dragged indices before it', () => {
    // action & result
    expect(getReorderedInsertionIndex([0, 1, 2], 5)).toBe(2);
  });

  it('should not shift the insertion index for dragged indices that come after it', () => {
    // action & result
    expect(getReorderedInsertionIndex([3, 4, 5], 1)).toBe(1);
  });

  it('should only subtract dragged indices strictly before the insertion point, for a mixed set', () => {
    // action & result
    expect(getReorderedInsertionIndex([0, 4, 6], 5)).toBe(3);
  });
});
