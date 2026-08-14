// utils
import { getRotatedAxisSigns } from '../getRotatedAxisSigns';

describe('getRotatedAxisSigns', () => {
  it('should pass the world scale signs through unchanged at 0deg rotation', () => {
    // result
    const result = getRotatedAxisSigns(-2, 3, 0);

    expect(result.x).toBeCloseTo(-2);
    expect(result.y).toBeCloseTo(3);
  });

  it('should swap the world scale signs onto the opposite local axis at 90deg rotation', () => {
    // mock — a world-X crossing (negative) should read as the local-Y sign at 90deg, and vice versa
    // result
    const result = getRotatedAxisSigns(-2, 3, 90);

    expect(result.x).toBeCloseTo(3);
    expect(result.y).toBeCloseTo(-2);
  });

  it('should treat an exact 45deg tie as unswapped, matching getRotatedAxisScales', () => {
    // result
    const result = getRotatedAxisSigns(-2, 3, 45);

    expect(result.x).toBeCloseTo(-2);
    expect(result.y).toBeCloseTo(3);
  });
});
