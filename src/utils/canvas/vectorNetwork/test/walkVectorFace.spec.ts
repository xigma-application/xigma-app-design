// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { buildVectorHalfEdgeAdjacency } from '../buildVectorHalfEdgeAdjacency';
import { walkVectorFace } from '../walkVectorFace';

const triangle: TVectorSegment[] = [
  { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
  { endId: 'c', id: 'bc', startId: 'b', tangentEnd: null, tangentStart: null },
  { endId: 'a', id: 'ca', startId: 'c', tangentEnd: null, tangentStart: null },
];
const triangleVertices: Record<string, TVectorVertex> = {
  a: { id: 'a', x: 0, y: 0 },
  b: { id: 'b', x: 100, y: 0 },
  c: { id: 'c', x: 100, y: 100 },
};

describe('walkVectorFace', () => {
  it('should close and return its steps when the walk returns to its own starting vertex', () => {
    // mock
    const adjacency = buildVectorHalfEdgeAdjacency(triangle, triangleVertices);

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, new Set(), triangle.length);

    // result
    expect(steps).toEqual([
      { fromId: 'a', segmentId: 'ab', toId: 'b' },
      { fromId: 'b', segmentId: 'bc', toId: 'c' },
      { fromId: 'c', segmentId: 'ca', toId: 'a' },
    ]);
  });

  it('should route around a branch vertex (degree 3+) by rotational order instead of aborting', () => {
    // mock — a square with a dangling tail "df" off corner "d", giving it degree 3. Walking the square
    // from "a" reaches "d" as an intermediate vertex (not the walk's own closing point) and must pick
    // "da" (continuing the square) over "df" (the tail) to close cleanly
    const square: TVectorSegment[] = [
      { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
      { endId: 'c', id: 'bc', startId: 'b', tangentEnd: null, tangentStart: null },
      { endId: 'd', id: 'cd', startId: 'c', tangentEnd: null, tangentStart: null },
      { endId: 'a', id: 'da', startId: 'd', tangentEnd: null, tangentStart: null },
      { endId: 'f', id: 'df', startId: 'd', tangentEnd: null, tangentStart: null },
    ];
    const squareVertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 100, y: 0 },
      c: { id: 'c', x: 100, y: 100 },
      d: { id: 'd', x: 0, y: 100 },
      f: { id: 'f', x: 0, y: 200 },
    };
    const adjacency = buildVectorHalfEdgeAdjacency(square, squareVertices);

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, new Set(), square.length);

    // result
    expect(steps).toEqual([
      { fromId: 'a', segmentId: 'ab', toId: 'b' },
      { fromId: 'b', segmentId: 'bc', toId: 'c' },
      { fromId: 'c', segmentId: 'cd', toId: 'd' },
      { fromId: 'd', segmentId: 'da', toId: 'a' },
    ]);
  });

  it('should backtrack along a dangling open segment (a degree-1 dead end) instead of aborting', () => {
    // mock — a single open segment: walking off its far end has nowhere else to go but back the way it came
    const open: TVectorSegment[] = [{ endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null }];
    const openVertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const adjacency = buildVectorHalfEdgeAdjacency(open, openVertices);

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, new Set(), open.length);

    // result — out along ab, then immediately back, closing on "a" again
    expect(steps).toEqual([
      { fromId: 'a', segmentId: 'ab', toId: 'b' },
      { fromId: 'b', segmentId: 'ab', toId: 'a' },
    ]);
  });

  it('should return null immediately without taking any step when its first half-edge is already visited', () => {
    // mock
    const adjacency = buildVectorHalfEdgeAdjacency(triangle, triangleVertices);
    const visited = new Set(['ab:a']);

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, visited, triangle.length);

    // result
    expect(steps).toBeNull();
    expect(visited.size).toBe(1);
  });

  it('should abort and return null mid-walk when the NEXT half-edge was already visited by an earlier, different walk — not the walk’s own starting half-edge, which the outer guard above already covers', () => {
    // mock — "visited" is a Set shared across every walkVectorFace call deriveVectorFaces makes in one
    // pass (one earlier call may have already fully traced a face using "bc:b"); this walk starts fresh
    // from "ab" (a half-edge visited elsewhere never blocks a DIFFERENT walk's own start), but must still
    // abort once it reaches a half-edge some other walk already claimed, rather than re-tracing over it
    const adjacency = buildVectorHalfEdgeAdjacency(triangle, triangleVertices);
    const visited = new Set(['bc:b']);

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, visited, triangle.length);

    // result
    expect(steps).toBeNull();
  });

  it('should abort and return null once it exhausts its step budget without closing', () => {
    // mock — a straight open chain of 4 segments, walked with a segmentCount deliberately smaller than
    // the chain so the loop's own step budget (2x segmentCount) runs out before the walk can complete
    // its out-and-back traversal of the whole dangling chain
    const chain: TVectorSegment[] = [
      { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
      { endId: 'c', id: 'bc', startId: 'b', tangentEnd: null, tangentStart: null },
      { endId: 'd', id: 'cd', startId: 'c', tangentEnd: null, tangentStart: null },
      { endId: 'e', id: 'de', startId: 'd', tangentEnd: null, tangentStart: null },
    ];
    const chainVertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 100, y: 0 },
      c: { id: 'c', x: 200, y: 0 },
      d: { id: 'd', x: 300, y: 0 },
      e: { id: 'e', x: 400, y: 0 },
    };
    const adjacency = buildVectorHalfEdgeAdjacency(chain, chainVertices);

    // before
    const steps = walkVectorFace('ab', 'a', 'b', adjacency, new Set(), 1);

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
