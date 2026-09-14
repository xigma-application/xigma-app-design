// utils
import { getGradientEndpointsAroundPivot } from '../getGradientEndpointsAroundPivot';

describe('getGradientEndpointsAroundPivot', () => {
  it('should place start at the given angle and end diametrically opposite, both at the given radius', () => {
    const { end, start } = getGradientEndpointsAroundPivot({ x: 50, y: 50 }, 10, 0);

    expect(start.x).toBeCloseTo(60, 5);
    expect(start.y).toBeCloseTo(50, 5);
    expect(end.x).toBeCloseTo(40, 5);
    expect(end.y).toBeCloseTo(50, 5);
  });

  it('should rotate both points together when the angle changes', () => {
    const { end, start } = getGradientEndpointsAroundPivot({ x: 50, y: 50 }, 10, Math.PI / 2);

    expect(start.x).toBeCloseTo(50, 5);
    expect(start.y).toBeCloseTo(60, 5);
    expect(end.x).toBeCloseTo(50, 5);
    expect(end.y).toBeCloseTo(40, 5);
  });

  it('should keep both points exactly radius away from the pivot regardless of angle', () => {
    const pivot = { x: 20, y: 30 };
    const radius = 15;
    const { end, start } = getGradientEndpointsAroundPivot(pivot, radius, 1.2345);

    expect(Math.hypot(start.x - pivot.x, start.y - pivot.y)).toBeCloseTo(radius, 5);
    expect(Math.hypot(end.x - pivot.x, end.y - pivot.y)).toBeCloseTo(radius, 5);
  });
});
