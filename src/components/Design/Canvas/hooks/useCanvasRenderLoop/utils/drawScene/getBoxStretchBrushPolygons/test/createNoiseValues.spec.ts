// utils
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { createNoiseValues } from '../createNoiseValues';

describe('createNoiseValues', () => {
  it('should return the requested number of values within -1 to 1', () => {
    // action
    const values = createNoiseValues(createSeededRandom('noise'), 50);

    // result
    expect(values).toHaveLength(50);
    expect(values.every((value) => value >= -1 && value < 1)).toBe(true);
  });

  it('should repeat for the same seed', () => {
    // result
    expect(createNoiseValues(createSeededRandom('a'), 10)).toEqual(createNoiseValues(createSeededRandom('a'), 10));
  });
});
