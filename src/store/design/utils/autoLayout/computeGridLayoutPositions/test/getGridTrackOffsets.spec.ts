// utils
import { getGridTrackOffsets } from '../getGridTrackOffsets';

describe('getGridTrackOffsets', () => {
  it('should return an empty array for no tracks', () => {
    expect(getGridTrackOffsets([], 10, 5)).toEqual([]);
  });

  it('should start the first track at the leading offset', () => {
    expect(getGridTrackOffsets([100], 10, 5)).toEqual([5]);
  });

  it('should accumulate each track size plus the gap', () => {
    expect(getGridTrackOffsets([100, 100, 50], 10, 5)).toEqual([5, 115, 225]);
  });

  it('should accumulate with a zero gap', () => {
    expect(getGridTrackOffsets([40, 60], 0, 0)).toEqual([0, 40]);
  });
});
