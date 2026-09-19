// utils
import { createSeededRandom } from '../createSeededRandom';

describe('createSeededRandom', () => {
  it('should give the same sequence for the same seed and a different one for another seed', () => {
    const first = createSeededRandom('node-1');
    const again = createSeededRandom('node-1');
    const other = createSeededRandom('node-2');

    expect([first(), first(), first()]).toEqual([again(), again(), again()]);
    expect(first()).not.toBe(other());
  });

  it('should stay within [0, 1)', () => {
    const random = createSeededRandom('range');

    Array.from({ length: 200 }, () => random()).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });
  });
});
