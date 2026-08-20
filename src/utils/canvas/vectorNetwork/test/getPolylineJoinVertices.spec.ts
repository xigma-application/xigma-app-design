// utils
import { getPolylineJoinVertices } from '../getPolylineJoinVertices';

describe('getPolylineJoinVertices', () => {
  it('should build a sharp miter join at a right-angle corner, matching a plain rectangle corner in Figma', () => {
    // before — point (10,0), previous segment offset (0,1), next segment offset (-1,0): the two
    // segments' own outer edges extend to meet at (11,-1), exactly halfWidth*sqrt(2) outward from the
    // corner, same as a standard 90deg miter join
    const vertices = getPolylineJoinVertices({ x: 10, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, 1);

    // result
    vertices.forEach((value, index) => expect(value).toBeCloseTo([10, 0, 10, -1, 11, -1, 10, 0, 11, -1, 11, 0][index]));
  });

  it('should build a sharp miter join at a right-angle corner turning the other way ("+offset" outer side)', () => {
    // before — the right-angle corner test above has previousOffset/nextOffset turning such that the
    // outer side is "-offset" (outerSign -1); swapping which axis is previous vs next flips the turn
    // direction, so the outer side here is "+offset" instead (outerSign +1), covering the other half
    // of that sign decision
    const vertices = getPolylineJoinVertices({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, 1);

    // result
    const expected = [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0];

    vertices.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));
  });

  it('should fall back to a plain bevel cut for a collinear (straight, no real corner) pair of segments', () => {
    // before — identical offsets: no turn at all, cross product is exactly zero
    const vertices = getPolylineJoinVertices({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 1 }, 1);

    // result — a zero-area quad (both "sides" coincide), harmless
    expect(vertices).toEqual([0, 1, 0, 1, 0, -1, 0, 1, 0, -1, 0, -1]);
  });

  it('should fall back to a plain bevel cut, instead of an absurdly long spike, past the miter limit on a near-reversed turn', () => {
    // mock — a ~170deg turn: the two segments almost double back on themselves, so a true miter point
    // would shoot out to over 11x halfWidth — MITER_LIMIT (4x) caps that with a flat bevel cut instead,
    // same as the browser's own Canvas/SVG default stroke-join behavior
    const previousOffset = { x: 1, y: 0 };
    const nextOffset = { x: -0.984807753012208, y: 0.17364817766693028 };

    // before
    const vertices = getPolylineJoinVertices({ x: 0, y: 0 }, previousOffset, nextOffset, 1);

    // result — the plain bevel quad connecting both offset directions on both sides of the point
    const expected = [
      1, 0, -0.984807753012208, 0.17364817766693028, 0.984807753012208, -0.17364817766693028, 1, 0, 0.984807753012208, -0.17364817766693028,
      -1, 0,
    ];

    vertices.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));
  });

  it('should fall back to a plain bevel cut for an exact 180deg fold (segments doubling straight back)', () => {
    // before — opposite offsets: the bisector sum is exactly zero, no direction to miter toward
    const vertices = getPolylineJoinVertices({ x: 5, y: 5 }, { x: 0, y: 1 }, { x: 0, y: -1 }, 1);

    // result — a zero-area quad again, same degenerate-but-harmless shape as the collinear case
    expect(vertices).toEqual([5, 6, 5, 4, 5, 6, 5, 6, 5, 6, 5, 4]);
  });
});
