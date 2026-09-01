// utils
import { resizeVectorVertices } from '../resizeVectorVertices';

describe('resizeVectorVertices', () => {
  it('should scale each vertex anchor-relatively per axis', () => {
    // before
    const resized = resizeVectorVertices({ v1: { x: 0, y: 0 }, v2: { x: 10, y: 20 } }, { x: 5, y: 2 }, 2, 3);

    // result — anchor + (coord - anchor) * scale: v1 -> (5+(0-5)*2, 2+(0-2)*3) = (-5, -4); v2 -> (5+(10-5)*2, 2+(20-2)*3) = (15, 56)
    expect(resized).toEqual({ v1: { id: 'v1', x: -5, y: -4 }, v2: { id: 'v2', x: 15, y: 56 } });
  });

  it('should leave the coordinate untouched on any axis whose anchor is null', () => {
    // before
    const resized = resizeVectorVertices({ v1: { x: 1.4, y: 1.6 } }, { x: null, y: 0 }, 2, 2);

    // result — x untouched (anchor null), y = 0 + (1.6 - 0) * 2 = 3.2
    expect(resized).toEqual({ v1: { id: 'v1', x: 1.4, y: 3.2 } });
  });

  it('should never round a scaled result, since each vertex moves by a different amount and rounding independently would distort curves', () => {
    // before — a scale that lands off any whole pixel, the way a real drag-resize almost always does
    const resized = resizeVectorVertices({ v1: { x: 3, y: 7 } }, { x: 0, y: 0 }, 1.1, 1.3);

    // result — 3 * 1.1 = 3.3000000000000003 in floating point; a rounding pass would collapse this
    // (and every other vertex) to the nearest integer independently, destroying the shape's own
    // relative proportions between vertices
    expect(resized.v1.x).toBeCloseTo(3.3);
    expect(resized.v1.y).toBeCloseTo(9.1);
    expect(Number.isInteger(resized.v1.x)).toBe(false);
  });
});
