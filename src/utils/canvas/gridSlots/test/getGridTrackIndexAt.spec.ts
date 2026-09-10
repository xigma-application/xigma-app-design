// utils
import { getGridTrackIndexAt } from '../getGridTrackIndexAt';

describe('getGridTrackIndexAt', () => {
  it('should return the track whose span contains the coordinate', () => {
    // tracks 20 / 60 / 100 with a 10 gap: track 1 spans [30, 90)
    expect(getGridTrackIndexAt([20, 60, 100], 10, 50, false)).toBe(1);
  });

  it('should return 0 for a negative coordinate', () => {
    expect(getGridTrackIndexAt([20, 60], 0, -5, false)).toBe(0);
  });

  it('should return 0 when there are no tracks', () => {
    expect(getGridTrackIndexAt([], 0, 40, true)).toBe(0);
  });

  it('should clamp to the last track past the end when overflow is not allowed', () => {
    expect(getGridTrackIndexAt([20, 60], 0, 500, false)).toBe(1);
  });

  it('should extrapolate extra tracks past the end using the last track size when overflow is allowed', () => {
    // two 30-wide tracks fill [0, 60); the last track's 30 stride puts 90 one row further -> track 3
    expect(getGridTrackIndexAt([30, 30], 0, 90, true)).toBe(3);
  });

  it('should return the track count past the end when the last track has no width', () => {
    expect(getGridTrackIndexAt([0, 0], 0, 5, true)).toBe(2);
  });
});
