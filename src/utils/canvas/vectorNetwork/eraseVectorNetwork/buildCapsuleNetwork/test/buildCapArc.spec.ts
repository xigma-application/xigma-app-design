// utils
import { buildCapArc } from '../buildCapArc';

describe('buildCapArc', () => {
  it('should sweep half a circle of nine points around the center at the radius', () => {
    // before
    const arc = buildCapArc({ x: 10, y: 10 }, 0, 1, 5);

    // result
    expect(arc).toHaveLength(9);
    arc.forEach((point) => expect(Math.hypot(point.x - 10, point.y - 10)).toBeCloseTo(5));
    expect(arc[0].y).toBeLessThan(10);
    expect(arc[8].y).toBeGreaterThan(10);
  });

  it('should sweep the other way with a negative sign', () => {
    // before
    const arc = buildCapArc({ x: 0, y: 0 }, 0, -1, 5);

    // result
    expect(arc[4].x).toBeLessThan(0);
  });
});
