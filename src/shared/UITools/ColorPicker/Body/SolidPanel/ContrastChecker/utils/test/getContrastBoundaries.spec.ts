// utils
import { getContrastBoundaries } from '../getContrastBoundaries';

describe('getContrastBoundaries', () => {
  it('should return only the darker-side boundary for a light background, since a lighter foreground can never out-contrast white', () => {
    const boundaries = getContrastBoundaries(0, 1, 4.5);

    expect(boundaries).toHaveLength(1);
    expect(boundaries[0].passSide).toBe('darker');
  });

  it('should return only the lighter-side boundary for a dark background, since a darker foreground can never out-contrast black', () => {
    const boundaries = getContrastBoundaries(0, 0, 4.5);

    expect(boundaries).toHaveLength(1);
    expect(boundaries[0].passSide).toBe('lighter');
  });

  it('should return both boundaries for a mid-luminance background where both directions are achievable', () => {
    const boundaries = getContrastBoundaries(0, 0.18, 3);

    expect(boundaries.map((boundary) => boundary.passSide).sort()).toEqual(['darker', 'lighter']);
  });

  it('should return no boundaries when the target ratio is unreachable by any color against this background', () => {
    // against a mid-gray (luminance 0.18) background, even pure black or pure white only reach
    // ~4.6:1 — no color at all (any hue) can reach 21:1 here, so both bounds fall outside [0,1]
    const boundaries = getContrastBoundaries(240, 0.18, 21);

    expect(boundaries).toEqual([]);
  });
});
