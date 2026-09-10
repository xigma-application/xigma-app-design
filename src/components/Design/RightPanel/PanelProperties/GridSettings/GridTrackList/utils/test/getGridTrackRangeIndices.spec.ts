// utils
import { getGridTrackRangeIndices } from '../getGridTrackRangeIndices';

describe('getGridTrackRangeIndices', () => {
  it('should return the inclusive range when the anchor is below the index', () => {
    expect(getGridTrackRangeIndices(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it('should return the inclusive range when the anchor is above the index', () => {
    expect(getGridTrackRangeIndices(4, 1)).toEqual([1, 2, 3, 4]);
  });

  it('should return a single index when anchor and index match', () => {
    expect(getGridTrackRangeIndices(2, 2)).toEqual([2]);
  });
});
