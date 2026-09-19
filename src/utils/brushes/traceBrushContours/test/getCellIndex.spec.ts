// utils
import { getCellIndex } from '../getCellIndex';
import { createStrip } from './stripFixtures';

describe('getCellIndex', () => {
  it('should set one bit per inside corner', () => {
    // before
    const strip = createStrip(3, 3, (column, row) => column === 1 && row === 1);

    // result
    expect(getCellIndex(strip, 1, 1)).toBe(4);
    expect(getCellIndex(strip, 2, 1)).toBe(8);
    expect(getCellIndex(strip, 1, 2)).toBe(2);
    expect(getCellIndex(strip, 2, 2)).toBe(1);
  });

  it('should be 0 outside and 15 fully inside', () => {
    // result
    expect(
      getCellIndex(
        createStrip(3, 3, () => false),
        1,
        1,
      ),
    ).toBe(0);
    expect(
      getCellIndex(
        createStrip(3, 3, () => true),
        1,
        1,
      ),
    ).toBe(15);
  });
});
