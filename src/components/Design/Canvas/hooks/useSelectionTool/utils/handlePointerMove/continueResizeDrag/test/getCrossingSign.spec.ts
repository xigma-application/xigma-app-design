// utils
import { getCrossingSign } from '../getCrossingSign';

describe('getCrossingSign', () => {
  it('should return 1 for a positive scale', () => {
    // result
    expect(getCrossingSign(2)).toBe(1);
  });

  it('should return -1 for a negative scale', () => {
    // result
    expect(getCrossingSign(-2)).toBe(-1);
  });

  it('should return 1, not 0, for an exact-zero scale', () => {
    // result — unlike Math.sign(0) === 0, which would zero out the anchor offset mid-crossing
    expect(getCrossingSign(0)).toBe(1);
  });
});
