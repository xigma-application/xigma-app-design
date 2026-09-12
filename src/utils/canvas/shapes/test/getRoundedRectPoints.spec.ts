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

  it('should trace a squircle corner instead of a plain arc once cornerSmoothing is set', () => {
    // before
    const rounded = getRoundedRectPoints({ cornerRadius: 10, height: 60, width: 100, x: 0, y: 0 }, 4);
    const smoothed = getRoundedRectPoints({ cornerRadius: 10, cornerSmoothing: 0.6, height: 60, width: 100, x: 0, y: 0 }, 4);

    // result — the squircle branch samples 3 curve pieces instead of one arc, so each corner grows
    expect(smoothed.length).toBeGreaterThan(rounded.length);
    // nw corner still starts on the left edge (reach = (1 + 0.6) * 10 = 16) and ends on the top edge
    expect(smoothed[0].x).toBeCloseTo(0);
    expect(smoothed[0].y).toBeCloseTo(16);
    expect(smoothed[12].x).toBeCloseTo(16);
    expect(smoothed[12].y).toBeCloseTo(0);
  });

  it('should ignore cornerSmoothing on a sharp (radius 0) corner', () => {
    // before
    const points = getRoundedRectPoints({ cornerRadius: 0, cornerSmoothing: 1, height: 60, width: 100, x: 0, y: 0 }, 2);

    // result
    expect(points.slice(0, 3)).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });
});
