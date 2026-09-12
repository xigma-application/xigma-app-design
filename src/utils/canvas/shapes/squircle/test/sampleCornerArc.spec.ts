// utils
import { sampleCornerArc } from '../sampleCornerArc';

describe('sampleCornerArc', () => {
  it('should sample points along the shorter arc between two points on the circle', () => {
    // before
    const points = sampleCornerArc({ x: 0, y: 0 }, 5, { x: 5, y: 0 }, { x: 0, y: 5 }, 2);

    // result
    expect(points[0]).toEqual({ x: 5, y: 0 });
    expect(points[1].x).toBeCloseTo(3.5355339);
    expect(points[1].y).toBeCloseTo(3.5355339);
    expect(points[2].x).toBeCloseTo(0);
    expect(points[2].y).toBeCloseTo(5);
  });

  it('should take the short way across the +/-180deg seam instead of the long way around', () => {
    // mock — from ~170deg to ~-170deg: the short path crosses the seam (delta = +20deg)
    const radius = 5;
    const from = { x: radius * Math.cos((170 * Math.PI) / 180), y: radius * Math.sin((170 * Math.PI) / 180) };
    const to = { x: radius * Math.cos((-170 * Math.PI) / 180), y: radius * Math.sin((-170 * Math.PI) / 180) };

    // before
    const points = sampleCornerArc({ x: 0, y: 0 }, radius, from, to, 2);

    // result — midpoint should sit right on the seam (angle 180deg), not near angle 0deg
    expect(points[1].x).toBeCloseTo(-radius);
    expect(points[1].y).toBeCloseTo(0);
  });
});
