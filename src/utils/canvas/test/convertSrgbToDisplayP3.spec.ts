// utils
import { convertSrgbToDisplayP3 } from '../convertSrgbToDisplayP3';

describe('convertSrgbToDisplayP3', () => {
  it('should leave white unchanged (the white point is shared between sRGB and Display P3)', () => {
    // action
    const [r, g, b] = convertSrgbToDisplayP3(1, 1, 1);

    // result
    expect(r).toBeCloseTo(1, 5);
    expect(g).toBeCloseTo(1, 5);
    expect(b).toBeCloseTo(1, 5);
  });

  it('should leave black unchanged', () => {
    // action
    const [r, g, b] = convertSrgbToDisplayP3(0, 0, 0);

    // result
    expect(r).toBeCloseTo(0, 5);
    expect(g).toBeCloseTo(0, 5);
    expect(b).toBeCloseTo(0, 5);
  });

  it('should convert a saturated sRGB red to the known reference Display P3 value (CSS Color 4 spec example)', () => {
    // action
    const [r, g, b] = convertSrgbToDisplayP3(1, 0, 0);

    // result — reference values for srgb(1 0 0) -> display-p3, since a fully saturated sRGB red sits
    // inside (not at the edge of) the wider P3 gamut, so it needs a mix of all three P3 primaries
    expect(r).toBeCloseTo(0.91749, 3);
    expect(g).toBeCloseTo(0.20028, 3);
    expect(b).toBeCloseTo(0.13862, 3);
  });

  it('should keep every channel within the valid 0-1 range for any in-gamut sRGB input', () => {
    // action
    const [r, g, b] = convertSrgbToDisplayP3(0.2, 0.6, 0.9);

    // result
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(1);
    expect(g).toBeGreaterThanOrEqual(0);
    expect(g).toBeLessThanOrEqual(1);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThanOrEqual(1);
  });

  it('should leave a neutral gray unchanged (no primaries involved, only the shared transfer curve)', () => {
    // action
    const [r, g, b] = convertSrgbToDisplayP3(0.5, 0.5, 0.5);

    // result
    expect(r).toBeCloseTo(0.5, 5);
    expect(g).toBeCloseTo(0.5, 5);
    expect(b).toBeCloseTo(0.5, 5);
  });
});
