// others
import { VECTOR_CURVE_MAX_SEGMENTS, VECTOR_CURVE_MIN_SEGMENTS } from 'constant/canvas';

// utils
import { getVectorCurveSegmentCount } from '../getVectorCurveSegmentCount';

describe('getVectorCurveSegmentCount', () => {
  it('should floor to the minimum segment count for a small, typical curve', () => {
    // result — a 100-unit-wide curve's control polygon is well under the adaptive threshold
    expect(getVectorCurveSegmentCount({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 50 }, { x: 0, y: -50 })).toBe(VECTOR_CURVE_MIN_SEGMENTS);
  });

  it('should scale the segment count up for a much larger arc, so its facets stay proportionally small', () => {
    // mock — a curve stretching thousands of world units, the "duży łuk" case reported as visibly faceted
    const small = getVectorCurveSegmentCount({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 50 }, { x: 0, y: -50 });
    const large = getVectorCurveSegmentCount({ x: 0, y: 0 }, { x: 5000, y: 0 }, { x: 0, y: 2500 }, { x: 0, y: -2500 });

    // result
    expect(large).toBeGreaterThan(small);
  });

  it('should cap out at the maximum segment count for an extremely large curve', () => {
    // result
    expect(getVectorCurveSegmentCount({ x: 0, y: 0 }, { x: 1000000, y: 0 }, { x: 0, y: 500000 }, { x: 0, y: -500000 })).toBe(
      VECTOR_CURVE_MAX_SEGMENTS,
    );
  });

  it('should treat a missing tangent’s control point as coinciding with its own vertex', () => {
    // result — only the end tangent is set, so the start-side control point is just the start vertex itself
    expect(getVectorCurveSegmentCount({ x: 0, y: 0 }, { x: 100, y: 0 }, null, { x: 0, y: 50 })).toBe(VECTOR_CURVE_MIN_SEGMENTS);
  });
});
