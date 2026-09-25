// utils
import { buildCapsulePolygon } from '../buildCapsulePolygon';

describe('buildCapsulePolygon', () => {
  it('should outline a straight path as two rails joined by round caps', () => {
    // before
    const polygon = buildCapsulePolygon(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      2,
    );

    // result
    expect(polygon).toHaveLength(2 + 8 + 1 + 7);
    expect(polygon[0]).toEqual({ x: 0, y: 2 });
    expect(Math.max(...polygon.map((point) => point.x))).toBeCloseTo(12, 0);
    expect(Math.min(...polygon.map((point) => point.x))).toBeCloseTo(-2, 0);
    polygon.forEach((point) => expect(Math.abs(point.y)).toBeLessThanOrEqual(2.0001));
  });
});
