// utils
import { getRoundedRingVertices } from '../getRoundedRingVertices';

describe('getRoundedRingVertices', () => {
  it('should return 4 corners * (ROUNDED_RECT_CORNER_SEGMENTS + 1) quads (36 * 6 vertices), not the sharp shape plain 4', () => {
    // result
    expect(getRoundedRingVertices({ height: 100, width: 100, x: 0, y: 0 }, 1, 5)).toHaveLength(36 * 6 * 2);
  });

  it('should shrink toward the sharp ring as cornerRadius shrinks', () => {
    // mock — at a tiny cornerRadius, the rounded ring's outer points should sit close to the plain
    // rectangle's own outer edge (x = -halfWidth)
    const vertices = getRoundedRingVertices({ height: 100, width: 100, x: 0, y: 0 }, 1, 0.001);
    const xValues = vertices.filter((_, index) => index % 2 === 0);

    expect(Math.min(...xValues)).toBeCloseTo(-1, 2);
  });
});
