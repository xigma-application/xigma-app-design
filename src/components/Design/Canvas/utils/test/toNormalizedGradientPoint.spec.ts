// utils
import { toNormalizedGradientPoint } from '../toNormalizedGradientPoint';

describe('toNormalizedGradientPoint', () => {
  it('should normalize a world point relative to the bounds origin and size', () => {
    expect(toNormalizedGradientPoint({ x: 50, y: 25 }, { height: 100, width: 100, x: 0, y: 0 })).toEqual({ x: 0.5, y: 0.25 });
  });

  it('should account for a non-zero bounds origin', () => {
    expect(toNormalizedGradientPoint({ x: 60, y: 45 }, { height: 100, width: 200, x: 10, y: 20 })).toEqual({ x: 0.25, y: 0.25 });
  });

  it('should return values outside 0..1 for a point beyond the bounds', () => {
    expect(toNormalizedGradientPoint({ x: 150, y: -50 }, { height: 100, width: 100, x: 0, y: 0 })).toEqual({ x: 1.5, y: -0.5 });
  });
});
