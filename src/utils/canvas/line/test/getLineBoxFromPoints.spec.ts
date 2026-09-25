// utils
import { getLineBoxFromPoints } from '../getLineBoxFromPoints';
import { getLinePoints } from '../getLinePoints';

describe('getLineBoxFromPoints', () => {
  it('should lay a zero-height box along the line, turned by its angle', () => {
    // result
    expect(getLineBoxFromPoints({ x1: 50, x2: 50, y1: -50, y2: 50 })).toEqual({ height: 0, rotation: 90, width: 100, x: 0, y: 0 });
  });

  it('should give a zero-length line an unrotated empty box', () => {
    // result
    expect(getLineBoxFromPoints({ x1: 5, x2: 5, y1: 7, y2: 7 })).toEqual({ height: 0, rotation: 0, width: 0, x: 5, y: 7 });
  });

  it('should round-trip back to the same points', () => {
    // mock
    const points = { x1: 12, x2: -30, y1: 4, y2: 60 };

    // before
    const roundTrip = getLinePoints(getLineBoxFromPoints(points));

    // result
    expect(roundTrip.x1).toBeCloseTo(points.x1);
    expect(roundTrip.y1).toBeCloseTo(points.y1);
    expect(roundTrip.x2).toBeCloseTo(points.x2);
    expect(roundTrip.y2).toBeCloseTo(points.y2);
  });
});
