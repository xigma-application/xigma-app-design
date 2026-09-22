// utils
import { getSvgAngularGradientPoint } from '../getSvgAngularGradientPoint';

const geometry = {
  direction: { x: 1, y: 0 },
  end: { x: 10, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 10,
  start: { x: 5, y: 5 },
};

describe('getSvgAngularGradientPoint', () => {
  it('should place angle 0 straight along the direction axis, scaled by reach (independent of primaryRadius)', () => {
    expect(getSvgAngularGradientPoint(geometry, 1, 20, 0)).toEqual({ x: 25, y: 5 });
  });

  it('should place a right-angle turn along the perpendicular axis, scaled by reach and radiusRatio', () => {
    const point = getSvgAngularGradientPoint(geometry, 2, 20, Math.PI / 2);

    expect(point.x).toBeCloseTo(5);
    expect(point.y).toBeCloseTo(5 + 20 * 2);
  });

  it('should place a half turn opposite the direction axis', () => {
    const point = getSvgAngularGradientPoint(geometry, 1, 20, Math.PI);

    expect(point.x).toBeCloseTo(-15);
    expect(point.y).toBeCloseTo(5);
  });
});
