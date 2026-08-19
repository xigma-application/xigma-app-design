// utils
import { getSegmentMidpoint } from '../getSegmentMidpoint';

describe('getSegmentMidpoint', () => {
  it('should return the average of the two endpoints for a straight segment', () => {
    // result
    expect(getSegmentMidpoint({ x: 0, y: 0 }, { x: 100, y: 0 }, null, null)).toEqual({ x: 50, y: 0 });
  });

  it('should return the point at the curve’s t=0.5 for a curved segment', () => {
    // result — a symmetric curve bowing away from the straight line at its midpoint
    expect(getSegmentMidpoint({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 50 }, { x: 0, y: -50 })).toEqual({ x: 50, y: 0 });
  });

  it('should ignore an asymmetric tangent on only one end and still bisect by curve parameter', () => {
    // result
    const midpoint = getSegmentMidpoint({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 60 }, null);

    expect(midpoint.x).toBeCloseTo(50);
    expect(midpoint.y).toBeGreaterThan(0);
  });
});
