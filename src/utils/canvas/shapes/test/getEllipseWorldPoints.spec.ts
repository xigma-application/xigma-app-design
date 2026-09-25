// utils
import { getEllipseFillPoints } from '../getEllipseFillPoints';
import { getEllipseWorldPoints } from '../getEllipseWorldPoints';

const ellipse = { arcEndAngle: 180, height: 100, width: 100, x: 0, y: 0 };

describe('getEllipseWorldPoints', () => {
  it('should mirror the shape around its centre when flipped', () => {
    // before
    const points = getEllipseWorldPoints(ellipse, true, false, 0);

    // result
    expect(points[1].x).toBeCloseTo(100 - getEllipseFillPoints(ellipse)[1].x);
  });

  it('should turn the shape around its centre', () => {
    // before
    const points = getEllipseWorldPoints(ellipse, false, false, 180);
    const local = getEllipseFillPoints(ellipse);

    // result
    expect(points[1].x).toBeCloseTo(100 - local[1].x);
    expect(points[1].y).toBeCloseTo(100 - local[1].y);
  });
});
