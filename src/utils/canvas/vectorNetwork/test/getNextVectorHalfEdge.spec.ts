// utils
import { getNextVectorHalfEdge } from '../getNextVectorHalfEdge';

describe('getNextVectorHalfEdge', () => {
  it('should pick the other edge at a degree-2 vertex (the same behavior a simple loop always needs)', () => {
    // mock — arriving at "b" via a->b; b's only other option is c
    const adjacency = new Map([
      [
        'b',
        [
          { segmentId: 'bc', toId: 'c' },
          { segmentId: 'ab', toId: 'a' },
        ],
      ],
    ]);

    // result
    expect(getNextVectorHalfEdge(adjacency, 'a', 'b', 'ab')).toEqual({ segmentId: 'bc', toId: 'c' });
  });

  it('should backtrack onto the twin itself at a degree-1 dead end', () => {
    // mock — b has no other outgoing edge besides the one back to a
    const adjacency = new Map([['b', [{ segmentId: 'ab', toId: 'a' }]]]);

    // result
    expect(getNextVectorHalfEdge(adjacency, 'a', 'b', 'ab')).toEqual({ segmentId: 'ab', toId: 'a' });
  });

  it('should pick the edge immediately clockwise from the twin (the one before it in the angle-sorted list) at a branch vertex', () => {
    // mock — sorted ascending by angle: to c, to a (twin), to d — the one before the twin is "to c"
    const adjacency = new Map([
      [
        'b',
        [
          { segmentId: 'bc', toId: 'c' },
          { segmentId: 'ab', toId: 'a' },
          { segmentId: 'bd', toId: 'd' },
        ],
      ],
    ]);

    // result
    expect(getNextVectorHalfEdge(adjacency, 'a', 'b', 'ab')).toEqual({ segmentId: 'bc', toId: 'c' });
  });

  it('should wrap around to the last entry when the twin is first in the sorted list', () => {
    // mock — twin ("ab") is at index 0, so the "previous" entry wraps to the last one
    const adjacency = new Map([
      [
        'b',
        [
          { segmentId: 'ab', toId: 'a' },
          { segmentId: 'bc', toId: 'c' },
          { segmentId: 'bd', toId: 'd' },
        ],
      ],
    ]);

    // result
    expect(getNextVectorHalfEdge(adjacency, 'a', 'b', 'ab')).toEqual({ segmentId: 'bd', toId: 'd' });
  });

  it('should return null when the arrival vertex has no adjacency entry at all', () => {
    // mock
    const adjacency = new Map<string, { segmentId: string; toId: string }[]>();

    // result
    expect(getNextVectorHalfEdge(adjacency, 'a', 'b', 'ab')).toBeNull();
  });

  it('should return null when the twin half-edge cannot be found among the arrival vertex’s own edges', () => {
    // mock — malformed/inconsistent adjacency: "b" has no edge back to "a" at all
    const adjacency = new Map([['b', [{ segmentId: 'bc', toId: 'c' }]]]);

    // result
    expect(getNextVectorHalfEdge(adjacency, 'a', 'b', 'ab')).toBeNull();
  });
});
