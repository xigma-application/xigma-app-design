// utils
import { getPaddedValue } from '../getPaddedValue';
import { createStrip } from './stripFixtures';

const strip = createStrip(4, 3, () => true);

describe('getPaddedValue', () => {
  it('should read the strip shifted by one cell', () => {
    // result
    expect(getPaddedValue(strip, 1, 1)).toBe(1);
    expect(getPaddedValue(strip, 4, 3)).toBe(1);
  });

  it('should be zero on the padded border', () => {
    // result
    expect(getPaddedValue(strip, 0, 1)).toBe(0);
    expect(getPaddedValue(strip, 5, 1)).toBe(0);
    expect(getPaddedValue(strip, 1, 0)).toBe(0);
    expect(getPaddedValue(strip, 1, 4)).toBe(0);
  });
});
