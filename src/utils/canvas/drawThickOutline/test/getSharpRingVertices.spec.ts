// utils
import { getSharpRingVertices } from '../getSharpRingVertices';

describe('getSharpRingVertices', () => {
  it('should return 4 quads (24 vertices, 48 flat numbers) for a plain rectangle', () => {
    // result
    expect(getSharpRingVertices({ height: 20, width: 10, x: 0, y: 0 }, 1)).toHaveLength(48);
  });

  it('should draw a hollow ring, not a filled rect', () => {
    // mock — a 10x20 rect with halfWidth 1: the ring's outer edge sits at y=-1/21, the inner edge at y=1/19
    const vertices = getSharpRingVertices({ height: 20, width: 10, x: 0, y: 0 }, 1);
    const yValues = vertices.filter((_, index) => index % 2 === 1);

    expect(yValues).toContain(1);
    expect(yValues).toContain(19);
  });

  it('should offset the outer and inner edges independently when given separate extents', () => {
    // mock — outer 3, inner 0: the ring spreads out to y=-3/23 and its inner edge stays on the rect (y=0/20)
    const vertices = getSharpRingVertices({ height: 20, width: 10, x: 0, y: 0 }, 3, 0);
    const yValues = vertices.filter((_, index) => index % 2 === 1);

    expect(Math.min(...yValues)).toBe(-3);
    expect(Math.max(...yValues)).toBe(23);
    expect(yValues).toContain(0);
    expect(yValues).toContain(20);
  });
});
