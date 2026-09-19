// utils
import { getStretchStep } from '../getStretchStep';

const octave = (wavelength: number): { amplitude: number; smoothen: number; stepped: boolean; values: number[]; wavelength: number } => ({
  amplitude: 1,
  smoothen: 0,
  stepped: false,
  values: [0, 0],
  wavelength,
});

describe('getStretchStep', () => {
  it('should be half the finest wavelength', () => {
    // result
    expect(getStretchStep([octave(40), octave(4), octave(10)], 400)).toBe(2);
  });

  it('should never go below the sample budget for the perimeter', () => {
    // result
    expect(getStretchStep([octave(0.001)], 400)).toBeCloseTo(400 / 20000);
  });
});
