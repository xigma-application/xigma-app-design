// utils
import { getStrokeJoinPoints } from '../getStrokeJoinPoints';

describe('getStrokeJoinPoints', () => {
  it('should return a single miter point at a right-angle corner', () => {
    // mock — a 90deg corner turning from "up" to "right", half-width 2
    const vertex = { x: 0, y: 0 };
    const offsetPrevious = { x: 0, y: -2 };
    const offsetNext = { x: 2, y: 0 };

    // action
    const result = getStrokeJoinPoints(vertex, offsetPrevious, offsetNext, 2);

    // result — miter point sits on the diagonal bisector at distance halfWidth*sqrt(2)
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(2);
    expect(result[0].y).toBeCloseTo(-2);
  });

  it('should fall back to two bevel points when the two edges fold exactly back on themselves', () => {
    // mock — offsets pointing in exactly opposite directions, bisector sum is zero
    const vertex = { x: 5, y: 5 };
    const offsetPrevious = { x: 2, y: 0 };
    const offsetNext = { x: -2, y: 0 };

    // action
    const result = getStrokeJoinPoints(vertex, offsetPrevious, offsetNext, 2);

    // result
    expect(result).toEqual([
      { x: 7, y: 5 },
      { x: 3, y: 5 },
    ]);
  });

  it('should fall back to two bevel points when the corner is sharper than the miter limit', () => {
    // mock — a near-180deg turn (170deg), sharp enough that the miter would extend past 4x halfWidth
    const halfWidth = 1;
    const angle = (170 * Math.PI) / 180;
    const vertex = { x: 0, y: 0 };
    const offsetPrevious = { x: halfWidth, y: 0 };
    const offsetNext = { x: Math.cos(angle) * halfWidth, y: Math.sin(angle) * halfWidth };

    // action
    const result = getStrokeJoinPoints(vertex, offsetPrevious, offsetNext, halfWidth);

    // result
    expect(result).toEqual([
      { x: vertex.x + offsetPrevious.x, y: vertex.y + offsetPrevious.y },
      { x: vertex.x + offsetNext.x, y: vertex.y + offsetNext.y },
    ]);
  });
});
