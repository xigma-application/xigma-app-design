// utils
import { getClosestPointOnSegment } from '../getClosestPointOnSegment';

describe('getClosestPointOnSegment', () => {
  it('should drop the point onto the segment and stop at its ends', () => {
    // result
    expect(getClosestPointOnSegment({ x: 5, y: 7 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toEqual({ x: 5, y: 0 });
    expect(getClosestPointOnSegment({ x: -5, y: 7 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(getClosestPointOnSegment({ x: 15, y: 7 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toEqual({ x: 10, y: 0 });
  });

  it('should give the start of a segment without length', () => {
    // result
    expect(getClosestPointOnSegment({ x: 5, y: 7 }, { x: 1, y: 1 }, { x: 1, y: 1 })).toEqual({ x: 1, y: 1 });
  });
});
