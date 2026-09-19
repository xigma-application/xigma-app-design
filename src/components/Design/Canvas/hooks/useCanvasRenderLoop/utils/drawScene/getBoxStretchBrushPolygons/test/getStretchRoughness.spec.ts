// utils
import { getStretchRoughness } from '../getStretchRoughness';

const octaves = [{ amplitude: 1, smoothen: 0, stepped: false, values: [1, 1], wavelength: 10 }];

describe('getStretchRoughness', () => {
  it('should be 1 without roughness', () => {
    // result
    expect(getStretchRoughness(octaves, 3, 1, 0)).toBe(1);
  });

  it('should grow with the roughness and be stronger where the brush is thinner', () => {
    // result
    expect(getStretchRoughness(octaves, 3, 1, 0.2)).toBeCloseTo(1.2);
    expect(getStretchRoughness(octaves, 3, 0.4, 0.2)).toBeCloseTo(1 + 0.2 * (1 + 1.5 * 0.6));
  });
});
