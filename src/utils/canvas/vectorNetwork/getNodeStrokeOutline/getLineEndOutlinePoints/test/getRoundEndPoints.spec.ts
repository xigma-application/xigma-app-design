// others
import { LINE_ENDPOINT_ARC_SEGMENTS } from 'constant/canvas';

// utils
import { getRoundEndPoints } from '../getRoundEndPoints';

describe('getRoundEndPoints', () => {
  it('should close the line end with a half circle as wide as the line', () => {
    // before
    const points = getRoundEndPoints(2);

    // result
    expect(points).toHaveLength(LINE_ENDPOINT_ARC_SEGMENTS + 1);
    expect(points[0].x).toBeCloseTo(0);
    expect(points[0].y).toBeCloseTo(2);
    expect(points[LINE_ENDPOINT_ARC_SEGMENTS / 2].x).toBeCloseTo(2);
    expect(points[LINE_ENDPOINT_ARC_SEGMENTS].y).toBeCloseTo(-2);
    expect(points.every(({ x, y }) => Math.abs(Math.hypot(x, y) - 2) < 1e-9)).toBe(true);
  });
});
