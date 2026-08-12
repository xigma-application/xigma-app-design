// utils
import { getEllipsePoints } from '../getEllipsePoints';

describe('getEllipsePoints', () => {
  it('should return the requested number of boundary points', () => {
    // result
    expect(getEllipsePoints({ height: 20, width: 10, x: 0, y: 0 }, 8)).toHaveLength(8);
  });

  it('should place points on the ellipse centered on the bounding rect', () => {
    // before
    const points = getEllipsePoints({ height: 20, width: 10, x: 0, y: 0 }, 4);

    // result
    expect(points[0]).toEqual({ x: 10, y: 10 });
    expect(points[1].x).toBeCloseTo(5);
    expect(points[1].y).toBeCloseTo(20);
  });

  it('should offset points by the rect origin', () => {
    // before
    const points = getEllipsePoints({ height: 20, width: 10, x: 5, y: 5 }, 4);

    // result
    expect(points[0]).toEqual({ x: 15, y: 15 });
  });
});
