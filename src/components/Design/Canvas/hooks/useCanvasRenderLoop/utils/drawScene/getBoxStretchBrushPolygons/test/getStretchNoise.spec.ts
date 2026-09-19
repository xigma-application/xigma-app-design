// utils
import { getStretchNoise } from '../getStretchNoise';

const octave = { amplitude: 0.5, smoothen: 0, stepped: false, values: [1, -1], wavelength: 10 };

describe('getStretchNoise', () => {
  it('should sum the octaves weighted by their amplitude', () => {
    // result
    expect(getStretchNoise([octave], 0)).toBeCloseTo(0.5);
    expect(getStretchNoise([octave, { ...octave, amplitude: 0.25 }], 0)).toBeCloseTo(0.75);
  });

  it('should use the stepped noise for a stepped octave', () => {
    // result
    expect(getStretchNoise([{ ...octave, smoothen: 0.2, stepped: true }], 3)).toBeCloseTo(0.5);
  });
});
