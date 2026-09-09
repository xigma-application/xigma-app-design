// utils
import { getRoundedRingVertices } from '../getRoundedRingVertices';

describe('getRoundedRingVertices', () => {
  it('should return 4 corners * (ROUNDED_RECT_CORNER_SEGMENTS + 1) quads (36 * 6 vertices), not the sharp shape plain 4', () => {
    // result
    expect(getRoundedRingVertices({ height: 100, width: 100, x: 0, y: 0 }, 5, 1)).toHaveLength(36 * 6 * 2);
  });

  it('should shrink toward the sharp ring as cornerRadius shrinks', () => {
    // mock — at a tiny cornerRadius, the outer loop still reaches the expanded rect edge (x = -outer)
    const vertices = getRoundedRingVertices({ height: 100, width: 100, x: 0, y: 0 }, 0.001, 1);
    const xValues = vertices.filter((_, index) => index % 2 === 0);

    expect(Math.min(...xValues)).toBeCloseTo(-1, 2);
  });

  it('should push only the outer loop outward for an outside-aligned stroke', () => {
    // mock — outer 2, inner 0: outer edge at x = -2, inner edge back at the rect (x = 0)
    const vertices = getRoundedRingVertices({ height: 100, width: 100, x: 0, y: 0 }, 5, 2, 0);
    const xValues = vertices.filter((_, index) => index % 2 === 0);

    expect(Math.min(...xValues)).toBeCloseTo(-2, 5);
    expect(Math.max(...xValues)).toBeCloseTo(102, 5);
  });

  it('should push only the inner loop inward for an inside-aligned stroke', () => {
    // mock — outer 0, inner 2: outer edge stays on the rect, inner edge pulled in by 2
    const vertices = getRoundedRingVertices({ height: 100, width: 100, x: 0, y: 0 }, 5, 0, 2);
    const xValues = vertices.filter((_, index) => index % 2 === 0);

    expect(Math.min(...xValues)).toBeCloseTo(0, 5);
    expect(Math.max(...xValues)).toBeCloseTo(100, 5);
  });
});
