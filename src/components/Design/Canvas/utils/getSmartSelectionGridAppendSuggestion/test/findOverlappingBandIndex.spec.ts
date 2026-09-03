// utils
import { findOverlappingBandIndex } from '../findOverlappingBandIndex';

describe('findOverlappingBandIndex', () => {
  it('should return the index of the band whose span overlaps the given range', () => {
    const starts = [0, 100, 200];
    const sizes = [50, 50, 50];

    expect(findOverlappingBandIndex(starts, sizes, 110, 130)).toBe(1);
  });

  it('should return -1 when no band overlaps the given range', () => {
    const starts = [0, 100, 200];
    const sizes = [50, 50, 50];

    expect(findOverlappingBandIndex(starts, sizes, 60, 90)).toBe(-1);
  });

  it('should return -1 for a range that only touches a band edge, not truly overlapping it', () => {
    const starts = [0, 100];
    const sizes = [50, 50];

    expect(findOverlappingBandIndex(starts, sizes, 50, 100)).toBe(-1);
  });
});
