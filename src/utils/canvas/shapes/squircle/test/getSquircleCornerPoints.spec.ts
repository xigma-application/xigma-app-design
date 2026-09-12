// utils
import { getSquircleCornerPoints } from '../getSquircleCornerPoints';

describe('getSquircleCornerPoints', () => {
  it('should start on the entry edge and end on the exit edge', () => {
    // before — a top-right-shaped corner at the origin: entry along +x, exit along +y
    const points = getSquircleCornerPoints({ entryDir: { x: 1, y: 0 }, exitDir: { x: 0, y: 1 }, vertex: { x: 0, y: 0 } }, 10, 0.5, 100, 4);

    // result
    expect(points[0].y).toBeCloseTo(0);
    expect(points[0].x).toBeLessThan(0);
    expect(points[points.length - 1].x).toBeCloseTo(0);
    expect(points[points.length - 1].y).toBeGreaterThan(0);
  });

  it('should emit 3 * segmentsPerCorner + 1 points', () => {
    // before
    const points = getSquircleCornerPoints({ entryDir: { x: 1, y: 0 }, exitDir: { x: 0, y: 1 }, vertex: { x: 0, y: 0 } }, 10, 0.6, 100, 5);

    // result
    expect(points).toHaveLength(16);
  });
});
