// utils
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { createStretchOctaves } from '../createStretchOctaves';

describe('createStretchOctaves', () => {
  it('should make a coarse, a medium and a fine octave that close around the loop', () => {
    // action
    const octaves = createStretchOctaves(createSeededRandom('octaves'), 400, 10);

    // result
    expect(octaves).toHaveLength(3);
    expect(octaves.map((octave) => octave.stepped)).toEqual([true, true, false]);
    expect(octaves[0].wavelength).toBeGreaterThan(octaves[1].wavelength);
    expect(octaves[1].wavelength).toBeGreaterThan(octaves[2].wavelength);
    octaves.forEach((octave) => expect(octave.values.length * octave.wavelength).toBeCloseTo(400));
  });
});
