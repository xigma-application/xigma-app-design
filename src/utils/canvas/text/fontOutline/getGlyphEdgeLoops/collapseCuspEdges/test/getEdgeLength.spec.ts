// utils
import { getEdgeLength } from '../getEdgeLength';

describe('getEdgeLength', () => {
  it('returns the straight-line distance between start and end', () => {
    expect(getEdgeLength({ end: { x: 3, y: 4 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null })).toBe(5);
  });

  it('returns 0 for a zero-length edge', () => {
    expect(getEdgeLength({ end: { x: 1, y: 1 }, start: { x: 1, y: 1 }, tangentEnd: null, tangentStart: null })).toBe(0);
  });

  it('ignores tangents — it measures the endpoints, not the curve', () => {
    const edge = {
      end: { x: 1, y: 0 },
      start: { x: 0, y: 0 },
      tangentEnd: { x: -5, y: -5 },
      tangentStart: { x: 5, y: 5 },
    };

    expect(getEdgeLength(edge)).toBe(1);
  });
});
