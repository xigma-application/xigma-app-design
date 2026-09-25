// utils
import { buildOpenStrokeRing } from '../buildOpenStrokeRing';

describe('buildOpenStrokeRing', () => {
  it('should build an open ring along the line with its edges half a stroke to either side', () => {
    // before
    const ring = buildOpenStrokeRing({ x: 0, y: 0 }, { x: 10, y: 0 }, 2);

    // result
    expect(ring).toEqual({
      closed: false,
      cumulative: [0, 10],
      inner: [
        { x: 0, y: 2 },
        { x: 10, y: 2 },
      ],
      lengths: [10, 0],
      mids: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      outer: [
        { x: 0, y: -2 },
        { x: 10, y: -2 },
      ],
      perimeter: 10,
    });
  });

  it('should keep the edges on the line for a zero-length one', () => {
    // before
    const ring = buildOpenStrokeRing({ x: 3, y: 3 }, { x: 3, y: 3 }, 2);

    // result
    expect(ring.outer).toEqual([
      { x: 3, y: 3 },
      { x: 3, y: 3 },
    ]);
  });
});
