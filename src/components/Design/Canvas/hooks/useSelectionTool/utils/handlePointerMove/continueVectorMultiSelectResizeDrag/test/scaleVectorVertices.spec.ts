// utils
import { scaleVectorVertices } from '../scaleVectorVertices';

describe('scaleVectorVertices', () => {
  it('should scale a vertex outward from a real anchor on both axes, rounding to whole pixels', () => {
    const origins = { v1: { x: 10, y: 10 } };

    const result = scaleVectorVertices(origins, { x: 0, y: 0 }, 0, { x: 0, y: 0 }, 2.4, 1.5);

    expect(result.v1).toEqual({ id: 'v1', x: 24, y: 15 });
  });

  it('should leave an axis with no anchor untouched, regardless of its own scale factor', () => {
    const origins = { v1: { x: 10, y: 10 } };

    const result = scaleVectorVertices(origins, { x: 0, y: 0 }, 0, { x: null, y: 0 }, 2, 3);

    expect(result.v1).toEqual({ id: 'v1', x: 10, y: 30 });
  });

  it('should scale along the box’s own (rotated) local axes, not world axes, when rotated', () => {
    // mock — a 90deg-rotated box: the vertex's local x/y (relative to the rotated axes) are what get
    // scaled, then the result rotates back to world space
    const origins = { v1: { x: 10, y: 20 } };

    const result = scaleVectorVertices(origins, { x: 0, y: 0 }, 90, { x: 0, y: 0 }, 2, 3);

    expect(result.v1).toEqual({ id: 'v1', x: 30, y: 40 });
  });

  it('should scale every vertex in the origins map independently', () => {
    const origins = { v1: { x: 10, y: 10 }, v2: { x: 20, y: 20 } };

    const result = scaleVectorVertices(origins, { x: 0, y: 0 }, 0, { x: 0, y: 0 }, 2, 2);

    expect(result).toEqual({
      v1: { id: 'v1', x: 20, y: 20 },
      v2: { id: 'v2', x: 40, y: 40 },
    });
  });
});
