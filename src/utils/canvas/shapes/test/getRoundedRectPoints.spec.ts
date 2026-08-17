// utils
import { getRoundedRectPoints } from '../getRoundedRectPoints';

describe('getRoundedRectPoints', () => {
  it('should emit segmentsPerCorner + 1 points for each of the 4 corners', () => {
    // before
    const points = getRoundedRectPoints({ cornerRadius: 10, height: 60, width: 100, x: 0, y: 0 }, 2);

    // result
    expect(points).toHaveLength(4 * 3);
  });

  it('should trace each quarter-circle arc around its own corner center', () => {
    // before
    const points = getRoundedRectPoints({ cornerRadius: 10, height: 60, width: 100, x: 0, y: 0 }, 2);

    // result — nw arc: starts on the left edge (0, 10), ends on the top edge (10, 0)
    expect(points[0].x).toBeCloseTo(0);
    expect(points[0].y).toBeCloseTo(10);
    expect(points[2].x).toBeCloseTo(10);
    expect(points[2].y).toBeCloseTo(0);
    // ne arc: starts on the top edge (90, 0), ends on the right edge (100, 10)
    expect(points[3].x).toBeCloseTo(90);
    expect(points[3].y).toBeCloseTo(0);
    expect(points[5].x).toBeCloseTo(100);
    expect(points[5].y).toBeCloseTo(10);
    // se arc: starts on the right edge (100, 50), ends on the bottom edge (90, 60)
    expect(points[6].x).toBeCloseTo(100);
    expect(points[6].y).toBeCloseTo(50);
    expect(points[8].x).toBeCloseTo(90);
    expect(points[8].y).toBeCloseTo(60);
    // sw arc: starts on the bottom edge (10, 60), ends on the left edge (0, 50)
    expect(points[9].x).toBeCloseTo(10);
    expect(points[9].y).toBeCloseTo(60);
    expect(points[11].x).toBeCloseTo(0);
    expect(points[11].y).toBeCloseTo(50);
  });

  it('should collapse every arc onto the sharp corner itself when the radius is 0', () => {
    // before
    const points = getRoundedRectPoints({ cornerRadius: 0, height: 60, width: 100, x: 0, y: 0 }, 2);

    // result — the first 3 points (the nw arc) all sit exactly on the nw corner
    expect(points.slice(0, 3)).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  it('should clamp an oversized radius to half the smaller dimension', () => {
    // before — max radius for a 100x60 rect is 30
    const points = getRoundedRectPoints({ cornerRadius: 1000, height: 60, width: 100, x: 0, y: 0 }, 2);

    // result
    expect(points[0].x).toBeCloseTo(0);
    expect(points[0].y).toBeCloseTo(30);
  });

  it('should clamp a negative radius to 0', () => {
    // before
    const points = getRoundedRectPoints({ cornerRadius: -10, height: 60, width: 100, x: 0, y: 0 }, 2);

    // result
    expect(points[0]).toEqual({ x: 0, y: 0 });
  });
});
