// utils
import { getPositionAroundGradientEllipse } from '../getPositionAroundGradientEllipse';

describe('getPositionAroundGradientEllipse', () => {
  it('should return 0 for a point in the same direction as the primary axis', () => {
    // before
    const position = getPositionAroundGradientEllipse({ x: 1, y: 0.5 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }, 1);

    // result
    expect(position).toBeCloseTo(0, 5);
  });

  it('should return 0.5 for a point opposite the primary axis', () => {
    // before
    const position = getPositionAroundGradientEllipse({ x: -1, y: 0.5 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }, 1);

    // result
    expect(position).toBeCloseTo(0.5, 5);
  });

  it('should return 0.25 for a point on the perpendicular axis', () => {
    // before — start (0,0.5), end (1,0.5): the perpendicular axis points toward +y
    const position = getPositionAroundGradientEllipse({ x: 0, y: 1.5 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }, 1);

    // result
    expect(position).toBeCloseTo(0.25, 5);
  });

  it('should account for radiusRatio when the perpendicular axis is scaled', () => {
    // before — a point at half the perpendicular reach of a radiusRatio-2 ellipse still sits on its rim (angle 0.25)
    const position = getPositionAroundGradientEllipse({ x: 0, y: 1 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }, 2);

    // result
    expect(position).toBeCloseTo(0.25, 5);
  });

  it('should return 0 when start and end coincide', () => {
    // before
    const position = getPositionAroundGradientEllipse({ x: 5, y: 5 }, { x: 1, y: 1 }, { x: 1, y: 1 }, 1);

    // result
    expect(position).toBe(0);
  });
});
