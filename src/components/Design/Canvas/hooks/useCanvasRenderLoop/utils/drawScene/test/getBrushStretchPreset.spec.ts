// utils
import { getBrushStretchPreset } from '../getBrushStretchPreset';

describe('getBrushStretchPreset', () => {
  it('should return the preset of the given slot', () => {
    // result
    expect(getBrushStretchPreset(9)).toEqual({ holes: 0, roughness: 0.1, taperEnd: 0.8, wavelength: 1 });
  });

  it('should wrap indices outside the preset range, including negative ones', () => {
    // result
    expect(getBrushStretchPreset(24)).toEqual(getBrushStretchPreset(9));
    expect(getBrushStretchPreset(-6)).toEqual(getBrushStretchPreset(9));
  });
});
