// utils
import { getEdgeLength } from '../getEdgeLength';

describe('getEdgeLength', () => {
  it('returns the straight-line distance between start and end', () => {
    expect(getEdgeLength({ start: { x: 0, y: 0 }, end: { x: 3, y: 4 }, tangentStart: null, tangentEnd: null })).toBe(5);
  });

  it('returns 0 for a zero-length edge', () => {
    expect(getEdgeLength({ start: { x: 1, y: 1 }, end: { x: 1, y: 1 }, tangentStart: null, tangentEnd: null })).toBe(0);
  });

  it('ignores tangents — it measures the endpoints, not the curve', () => {
    const edge = {
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
      tangentStart: { x: 5, y: 5 },
      tangentEnd: { x: -5, y: -5 },
    };

    expect(getEdgeLength(edge)).toBe(1);
  });
});
