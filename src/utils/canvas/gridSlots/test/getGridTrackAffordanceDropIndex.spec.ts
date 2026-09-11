// utils
import { getGridTrackAffordanceDropIndex } from '../getGridTrackAffordanceDropIndex';

const sizes = [100, 100, 100];
const gap = 10;

describe('getGridTrackAffordanceDropIndex', () => {
  it('should return 0 when the pointer sits before the first track’s midpoint', () => {
    expect(getGridTrackAffordanceDropIndex(sizes, gap, 20)).toBe(0);
  });

  it('should return 1 when the pointer sits past the first track’s midpoint but before the second’s', () => {
    expect(getGridTrackAffordanceDropIndex(sizes, gap, 60)).toBe(1);
  });

  it('should return 2 when the pointer sits past the second track’s midpoint but before the third’s', () => {
    expect(getGridTrackAffordanceDropIndex(sizes, gap, 170)).toBe(2);
  });

  it('should return the track count when the pointer is past every midpoint', () => {
    expect(getGridTrackAffordanceDropIndex(sizes, gap, 400)).toBe(3);
  });

  it('should return 0 for an empty track list', () => {
    expect(getGridTrackAffordanceDropIndex([], gap, 50)).toBe(0);
  });
});
