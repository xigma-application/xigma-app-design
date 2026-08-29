// utils
import { buildDotBatchVertices } from '../buildDotBatchVertices';

describe('buildDotBatchVertices', () => {
  it('should build one triangle fan (one triangle per rim edge) centered on a single dot', () => {
    // mock — a "diamond" unit rim of 4 points, so each triangle's shape is easy to check by hand
    const centers = [{ x: 10, y: 20 }];
    const unitRimPoints = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
    ];

    // before
    const vertices = buildDotBatchVertices(centers, unitRimPoints);

    // result — 4 triangles × 3 points × 2 floats
    expect(vertices).toHaveLength(24);
    // first triangle: center, first rim point (offset from center), next rim point (wrapping to index 1)
    expect(Array.from(vertices.slice(0, 6))).toEqual([10, 20, 11, 20, 10, 21]);
    // last triangle wraps back to rim point 0, proving the fan closes the loop
    expect(Array.from(vertices.slice(18, 24))).toEqual([10, 20, 10, 19, 11, 20]);
  });

  it('should lay out multiple dots back-to-back, each with its own center offset applied to every rim point', () => {
    // mock
    const centers = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ];
    const unitRimPoints = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ];

    // before
    const vertices = buildDotBatchVertices(centers, unitRimPoints);

    // result — 2 dots × 2 triangles × 3 points × 2 floats
    expect(vertices).toHaveLength(24);
    // the second dot's block starts right after the first dot's, offset by its own center
    expect(Array.from(vertices.slice(12, 14))).toEqual([100, 100]);
    expect(Array.from(vertices.slice(14, 16))).toEqual([101, 100]);
  });

  it('should return an empty array for no centers', () => {
    // before
    const vertices = buildDotBatchVertices([], [{ x: 1, y: 0 }]);

    // result
    expect(vertices).toHaveLength(0);
  });
});
