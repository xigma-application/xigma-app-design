// utils
import { getThickPolylineVertices } from '../getThickPolylineVertices';

describe('getThickPolylineVertices', () => {
  it('should produce a single quad (12 numbers) for a 2-point straight polyline', () => {
    // before
    const vertices = getThickPolylineVertices(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      1,
    );

    // result
    expect(vertices).toHaveLength(12);
  });

  it('should produce one quad per consecutive point pair for a 3+ point polyline', () => {
    // before — 2 consecutive pairs, 12 numbers (one quad) each
    const vertices = getThickPolylineVertices(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      1,
    );

    // result
    expect(vertices).toHaveLength(24);
  });

  it('should skip a zero-length segment pair (two identical consecutive points) and contribute nothing for it', () => {
    // before — only the second (non-degenerate) pair contributes a quad
    const vertices = getThickPolylineVertices(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      1,
    );

    // result
    expect(vertices).toHaveLength(12);
  });
});
