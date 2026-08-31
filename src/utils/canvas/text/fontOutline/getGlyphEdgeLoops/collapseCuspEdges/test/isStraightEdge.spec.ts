// utils
import { isStraightEdge } from '../isStraightEdge';

describe('isStraightEdge', () => {
  it('returns true when both tangents are null', () => {
    expect(isStraightEdge({ start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, tangentStart: null, tangentEnd: null })).toBe(true);
  });

  it('returns false when tangentStart is set', () => {
    expect(
      isStraightEdge({ start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, tangentStart: { x: 1, y: 0 }, tangentEnd: null }),
    ).toBe(false);
  });

  it('returns false when tangentEnd is set', () => {
    expect(
      isStraightEdge({ start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, tangentStart: null, tangentEnd: { x: 1, y: 0 } }),
    ).toBe(false);
  });

  it('returns false when both tangents are set', () => {
    expect(
      isStraightEdge({
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
        tangentStart: { x: 1, y: 0 },
        tangentEnd: { x: 0, y: 1 },
      }),
    ).toBe(false);
  });
});
