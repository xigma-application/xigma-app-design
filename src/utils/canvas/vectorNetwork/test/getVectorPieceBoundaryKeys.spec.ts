// utils
import { getVectorPieceBoundaryKeys } from '../getVectorPieceBoundaryKeys';

describe('getVectorPieceBoundaryKeys', () => {
  it('should key an unsplit segment’s two pieces boundaries by its own two real vertex ids', () => {
    // mock — segment "s1" was never crossed, so it exists as a single whole piece in planarSegments
    const planarSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before
    const boundaryKeys = getVectorPieceBoundaryKeys('s1', planarSegments, vertices);

    // result
    expect(boundaryKeys).toEqual({ s1: { end: 'v:b', start: 'v:a' } });
  });

  it('should key a split segment’s pieces by which other real segment each crossing borders, not by the crossing’s own drift-prone position', () => {
    // mock — "s1" was crossed once by "s2" at t=0.5, splitting it into "s1#0" and "s1#1"; the crossing
    // vertex id follows the real convention (sorted pair of real segment ids + t), and is NOT itself a
    // real vertex (absent from `vertices`)
    const planarSegments = {
      's1#0': { endId: 'x:s1:s2:0.500000', id: 's1#0', startId: 'a', tangentEnd: null, tangentStart: null },
      's1#1': { endId: 'b', id: 's1#1', startId: 'x:s1:s2:0.500000', tangentEnd: null, tangentStart: null },
    };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before
    const boundaryKeys = getVectorPieceBoundaryKeys('s1', planarSegments, vertices);

    // result — both pieces reference the crossing as "x:s2:0" (bordering segment s2, first occurrence)
    expect(boundaryKeys).toEqual({
      's1#0': { end: 'x:s2:0', start: 'v:a' },
      's1#1': { end: 'v:b', start: 'x:s2:0' },
    });
  });

  it('should only include pieces belonging to the requested real segment, ignoring an unrelated segment’s own pieces', () => {
    // mock
    const planarSegments = {
      's1#0': { endId: 'x:s1:s2:0.500000', id: 's1#0', startId: 'a', tangentEnd: null, tangentStart: null },
      's1#1': { endId: 'b', id: 's1#1', startId: 'x:s1:s2:0.500000', tangentEnd: null, tangentStart: null },
      's2#0': { endId: 'x:s1:s2:0.500000', id: 's2#0', startId: 'c', tangentEnd: null, tangentStart: null },
      's2#1': { endId: 'd', id: 's2#1', startId: 'x:s1:s2:0.500000', tangentEnd: null, tangentStart: null },
    };
    const vertices = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 100, y: 0 },
      c: { id: 'c', x: 50, y: -50 },
      d: { id: 'd', x: 50, y: 50 },
    };

    // before
    const boundaryKeys = getVectorPieceBoundaryKeys('s2', planarSegments, vertices);

    // result
    expect(Object.keys(boundaryKeys)).toEqual(['s2#0', 's2#1']);
  });

  it('should give a repeated crossing with the same other segment a stable, order-based occurrence tiebreaker', () => {
    // mock — "s1" crossed twice by the same "s2" (only possible with curves), at t=0.25 and t=0.75,
    // splitting it into 3 ordered pieces; the SAME crossing vertex id must resolve to the SAME
    // occurrence on both sides of it (s1#0's end and s1#1's start share "x:s2:0"), while the second,
    // distinct crossing vertex id gets the next occurrence
    const planarSegments = {
      's1#0': { endId: 'x:s1:s2:0.250000', id: 's1#0', startId: 'a', tangentEnd: null, tangentStart: null },
      's1#1': { endId: 'x:s1:s2:0.750000', id: 's1#1', startId: 'x:s1:s2:0.250000', tangentEnd: null, tangentStart: null },
      's1#2': { endId: 'b', id: 's1#2', startId: 'x:s1:s2:0.750000', tangentEnd: null, tangentStart: null },
    };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before
    const boundaryKeys = getVectorPieceBoundaryKeys('s1', planarSegments, vertices);

    // result
    expect(boundaryKeys).toEqual({
      's1#0': { end: 'x:s2:0', start: 'v:a' },
      's1#1': { end: 'x:s2:1', start: 'x:s2:0' },
      's1#2': { end: 'v:b', start: 'x:s2:1' },
    });
  });

  it('should sort a bare (un-hashed) piece id ahead of hashed ones, treating its own missing index as 0', () => {
    // mock — a piece list mixing an id with no "#index" suffix at all alongside a hashed sibling;
    // getPieceIndex must resolve the bare id's own sort key without a "#" to split on
    const planarSegments = {
      s1: { endId: 'x:s1:s2:0.500000', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      's1#0': { endId: 'b', id: 's1#0', startId: 'x:s1:s2:0.500000', tangentEnd: null, tangentStart: null },
    };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before
    const boundaryKeys = getVectorPieceBoundaryKeys('s1', planarSegments, vertices);

    // result — the bare id sorts to index 0, ahead of the explicitly-indexed "#0" sibling
    expect(Object.keys(boundaryKeys)).toEqual(['s1', 's1#0']);
  });
});
