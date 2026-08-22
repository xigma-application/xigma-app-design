// types
import { TVectorPieceBoundaries } from '../../getVectorPieceBoundaryKeys';

// utils
import { resolvePieceKeyToUnit } from '../resolvePieceKeyToUnit';

describe('resolvePieceKeyToUnit', () => {
  it('should return null for a malformed piece key that doesn’t match the "id[boundary|boundary]" pattern', () => {
    // mock
    const planarSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before / result
    expect(resolvePieceKeyToUnit('not-a-valid-key', planarSegments, vertices, new Map())).toBeNull();
  });

  it('should resolve an unsplit segment’s whole-piece key to a single-piece unit spanning its two real vertices', () => {
    // mock
    const planarSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before
    const unit = resolvePieceKeyToUnit('s1[v:a|v:b]', planarSegments, vertices, new Map());

    // result
    expect(unit).toEqual({ endId: 'b', id: 's1[v:a|v:b]', pieces: [planarSegments.s1], startId: 'a' });
  });

  it('should resolve a key anchored on a segment’s real endpoints into every current piece between them, even when a fresh crossing has split it further', () => {
    // mock — "s1" is now split into 2 pieces by a crossing that didn’t exist when the key was stored
    const planarSegments = {
      's1#0': { endId: 'x:s1:s2:0.500000', id: 's1#0', startId: 'a', tangentEnd: null, tangentStart: null },
      's1#1': { endId: 'b', id: 's1#1', startId: 'x:s1:s2:0.500000', tangentEnd: null, tangentStart: null },
    };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before
    const unit = resolvePieceKeyToUnit('s1[v:a|v:b]', planarSegments, vertices, new Map());

    // result
    expect(unit).toEqual({
      endId: 'b',
      id: 's1[v:a|v:b]',
      pieces: [planarSegments['s1#0'], planarSegments['s1#1']],
      startId: 'a',
    });
  });

  it('should reuse a previously computed boundary-key map for the same real segment id instead of recomputing it', () => {
    // mock — a pre-seeded cache entry that intentionally differs from what a fresh computation would
    // produce, proving the cache (not a recompute) is what gets used
    const planarSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const seededBoundaryKeys: Record<string, TVectorPieceBoundaries> = { s1: { end: 'v:z', start: 'v:a' } };
    const boundaryKeysByRealSegmentId = new Map([['s1', seededBoundaryKeys]]);

    // before
    const unit = resolvePieceKeyToUnit('s1[v:a|v:z]', planarSegments, vertices, boundaryKeysByRealSegmentId);

    // result
    expect(unit).toEqual({ endId: 'b', id: 's1[v:a|v:z]', pieces: [planarSegments.s1], startId: 'a' });
  });

  it('should return null when the real segment no longer has any current pieces at all', () => {
    // mock
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before / result
    expect(resolvePieceKeyToUnit('s1[v:a|v:b]', {}, vertices, new Map())).toBeNull();
  });

  it('should return null when one of the key’s two boundaries no longer exists in the segment’s current vertex sequence', () => {
    // mock — "s1" currently has no crossing at all, so "x:s2:0" can’t be located
    const planarSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before / result
    expect(resolvePieceKeyToUnit('s1[v:a|x:s2:0]', planarSegments, vertices, new Map())).toBeNull();
  });

  it('should return null when the key’s two boundaries resolve to the same position (an empty span)', () => {
    // mock
    const planarSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before / result
    expect(resolvePieceKeyToUnit('s1[v:a|v:a]', planarSegments, vertices, new Map())).toBeNull();
  });
});
