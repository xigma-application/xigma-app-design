// types
import { TVectorSegment } from 'types/design/types';

// utils
import { buildVectorHalfEdgeAdjacency } from '../buildVectorHalfEdgeAdjacency';
import { walkVectorFace } from '../walkVectorFace';

const triangle: TVectorSegment[] = [
  { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
  { endId: 'c', id: 'bc', startId: 'b', tangentEnd: null, tangentStart: null },
  { endId: 'a', id: 'ca', startId: 'c', tangentEnd: null, tangentStart: null },
];

describe('walkVectorFace', () => {
  it('should close and return its steps when the walk returns to its own starting vertex', () => {
    // mock
    const adjacency = buildVectorHalfEdgeAdjacency(triangle);

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, new Set(), triangle.length);

    // result
    expect(steps).toEqual([
      { fromId: 'a', segmentId: 'ab', toId: 'b' },
      { fromId: 'b', segmentId: 'bc', toId: 'c' },
      { fromId: 'c', segmentId: 'ca', toId: 'a' },
    ]);
  });

  it('should abort and return null when it reaches a vertex with 2+ unvisited ways onward (a branch)', () => {
    // mock — a tail segment "ad" gives vertex "a" degree 3, so walking the tail inward hits a branch there
    const withTail: TVectorSegment[] = [...triangle, { endId: 'd', id: 'ad', startId: 'a', tangentEnd: null, tangentStart: null }];
    const adjacency = buildVectorHalfEdgeAdjacency(withTail);
    const visited = new Set<string>();

    // before
    const steps = walkVectorFace('ad', 'd', 'a', adjacency, visited, withTail.length);

    // result
    expect(steps).toBeNull();
    // the one step actually taken (d -> a) stays recorded in visited even though the walk failed
    expect(visited.has('ad:d')).toBe(true);
  });

  it('should abort and return null when it reaches a vertex with 0 unvisited ways onward (a dead end)', () => {
    // mock — a single open segment: walking off its far end has nowhere else to go
    const open: TVectorSegment[] = [{ endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null }];
    const adjacency = buildVectorHalfEdgeAdjacency(open);
    const visited = new Set<string>();

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, visited, open.length);

    // result
    expect(steps).toBeNull();
    expect(visited.has('ab:a')).toBe(true);
  });

  it('should return null immediately without taking any step when its first half-edge is already visited', () => {
    // mock
    const adjacency = buildVectorHalfEdgeAdjacency(triangle);
    const visited = new Set(['ab:a']);

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, visited, triangle.length);

    // result
    expect(steps).toBeNull();
    expect(visited.size).toBe(1);
  });

  it('should abort and return null once it exhausts its segmentCount step budget without closing', () => {
    // mock — a straight open chain of 4 segments, walked with a segmentCount deliberately smaller than
    // the chain so the loop's own step budget runs out before the dead end past "e" would be reached
    const chain: TVectorSegment[] = [
      { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
      { endId: 'c', id: 'bc', startId: 'b', tangentEnd: null, tangentStart: null },
      { endId: 'd', id: 'cd', startId: 'c', tangentEnd: null, tangentStart: null },
      { endId: 'e', id: 'de', startId: 'd', tangentEnd: null, tangentStart: null },
    ];
    const adjacency = buildVectorHalfEdgeAdjacency(chain);

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, new Set(), 2);

    // result
    expect(steps).toBeNull();
  });

  it('should treat a vertex missing from the adjacency map as having no way onward (the ?? [] fallback)', () => {
    // mock — a hand-built, deliberately sparse adjacency map with no entry at all for "b", unlike what
    // buildVectorHalfEdgeAdjacency would ever produce for a real segment endpoint
    const adjacency = new Map([['a', [{ segmentId: 'ab', toId: 'b' }]]]);

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, new Set(), 1);

    // result
    expect(steps).toBeNull();
  });
});
