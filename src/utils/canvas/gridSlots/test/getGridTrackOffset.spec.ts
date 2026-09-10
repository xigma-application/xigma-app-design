// utils
import { getGridTrackOffset } from '../getGridTrackOffset';

describe('getGridTrackOffset', () => {
  it('should return 0 for the first track', () => {
    expect(getGridTrackOffset([20, 60, 100], 10, 0)).toBe(0);
  });

  it('should sum the preceding track sizes plus one gap per preceding track', () => {
    expect(getGridTrackOffset([20, 60, 100], 10, 2)).toBe(20 + 60 + 2 * 10);
  });

  it('should stop adding sizes past the end of the array but still count the gaps', () => {
    expect(getGridTrackOffset([30, 40], 5, 4)).toBe(30 + 40 + 4 * 5);
  });
});
