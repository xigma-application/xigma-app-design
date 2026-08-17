// utils
import { getMaxStarCornerRadius } from '../getMaxStarCornerRadius';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('getMaxStarCornerRadius', () => {
  it('should match the independently-computed reference for a 100x100 5-point star at ratio 0.5', () => {
    // result
    expect(getMaxStarCornerRadius(bounds, 5, 0.5)).toBeCloseTo(13.010931, 5);
  });

  it('should match the independently-computed reference for a 100x100 5-point star at the default-like ratio 0.382', () => {
    // result
    expect(getMaxStarCornerRadius(bounds, 5, 0.382)).toBeCloseTo(9.550028, 5);
  });

  it('should match the independently-computed reference for a 100x100 4-point star at ratio 0.5', () => {
    // result
    expect(getMaxStarCornerRadius(bounds, 4, 0.5)).toBeCloseTo(17.366846, 5);
  });

  it('should scale down for a non-square bounding box', () => {
    // mock — a taller-than-wide box constrains the max radius below the square case
    const tallBounds = { height: 200, width: 100, x: 0, y: 0 };

    // result
    expect(getMaxStarCornerRadius(tallBounds, 5, 0.5)).toBeCloseTo(10.928849, 5);
    expect(getMaxStarCornerRadius(tallBounds, 5, 0.5)).toBeLessThan(getMaxStarCornerRadius(bounds, 5, 0.5));
  });
});
