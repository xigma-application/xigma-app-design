// utils
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { getGaussian } from '../getGaussian';

describe('getGaussian', () => {
  it('should draw values centred on zero with a spread of about one', () => {
    // before
    const random = createSeededRandom('gaussian');
    const values = Array.from({ length: 4000 }, () => getGaussian(random));
    const mean = values.reduce((total, value) => total + value, 0) / values.length;
    const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;

    // result
    expect(Math.abs(mean)).toBeLessThan(0.1);
    expect(variance).toBeGreaterThan(0.8);
    expect(variance).toBeLessThan(1.2);
  });

  it('should survive a random source that returns zero', () => {
    // result
    expect(Number.isFinite(getGaussian(() => 0))).toBe(true);
  });
});
