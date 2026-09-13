// utils
import { getFillRangeIndices } from '../getFillRangeIndices';

describe('getFillRangeIndices', () => {
  it('should return the inclusive range from anchor to index, ascending', () => {
    expect(getFillRangeIndices(1, 3)).toEqual([1, 2, 3]);
  });

  it('should return the inclusive range regardless of which end is smaller', () => {
    expect(getFillRangeIndices(3, 1)).toEqual([1, 2, 3]);
  });

  it('should return a single index when anchor equals index', () => {
    expect(getFillRangeIndices(2, 2)).toEqual([2]);
  });
});
