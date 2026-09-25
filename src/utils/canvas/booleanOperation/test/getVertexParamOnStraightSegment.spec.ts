// utils
import { getVertexParamOnStraightSegment } from '../getVertexParamOnStraightSegment';

const start = { x: 0, y: 0 };
const end = { x: 10, y: 0 };

describe('getVertexParamOnStraightSegment', () => {
  it('should return where a point lying on the segment sits along it', () => {
    // result
    expect(getVertexParamOnStraightSegment(start, end, { x: 2.5, y: 0 })).toBe(0.25);
  });

  it('should reject points off the line, at the ends or beyond them', () => {
    // result
    expect(getVertexParamOnStraightSegment(start, end, { x: 5, y: 1 })).toBeNull();
    expect(getVertexParamOnStraightSegment(start, end, { x: 0, y: 0 })).toBeNull();
    expect(getVertexParamOnStraightSegment(start, end, { x: 12, y: 0 })).toBeNull();
  });

  it('should return nothing for a zero-length segment', () => {
    // result
    expect(getVertexParamOnStraightSegment(start, start, start)).toBeNull();
  });
});
