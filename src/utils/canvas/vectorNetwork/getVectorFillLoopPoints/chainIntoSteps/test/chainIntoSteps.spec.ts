// types
import { TResolvedPieceUnit } from '../../types';
import { TVectorVertex } from 'types/design/types';

// utils
import { chainIntoSteps } from '../chainIntoSteps';

const straightPiece = (id: string, startId: string, endId: string): TResolvedPieceUnit['pieces'][number] => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const unit = (id: string, startId: string, endId: string): TResolvedPieceUnit => ({
  endId,
  id,
  pieces: [straightPiece(id, startId, endId)],
  startId,
});

// The full planar network chainIntoSteps disambiguates against — by default, just the union of the
// given units' own pieces (i.e. no foreign edges at all), matching what a fully-isolated loop sees.
const planarSegmentsOf = (units: TResolvedPieceUnit[]): Record<string, TResolvedPieceUnit['pieces'][number]> =>
  Object.fromEntries(units.flatMap((unit) => unit.pieces).map((piece) => [piece.id, piece]));

describe('chainIntoSteps', () => {
  it('should chain multiple units into one closed loop of steps', () => {
    // mock — a(0,0)->b(10,0)->c(5,10)->a, a real (non-degenerate) triangle
    const units = [unit('s1', 'a', 'b'), unit('s2', 'b', 'c'), unit('s3', 'c', 'a')];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 10, y: 0 },
      c: { id: 'c', x: 5, y: 10 },
    };

    // before
    const steps = chainIntoSteps(units, vertices, planarSegmentsOf(units));

    // result
    expect(steps).toEqual([
      { fromId: 'a', segmentId: 's1', toId: 'b' },
      { fromId: 'b', segmentId: 's2', toId: 'c' },
      { fromId: 'c', segmentId: 's3', toId: 'a' },
    ]);
  });

  it('should accept a single self-closing unit (its own startId equals its own endId)', () => {
    // mock
    const units = [unit('s1', 'a', 'a')];
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 } };

    // before
    const steps = chainIntoSteps(units, vertices, planarSegmentsOf(units));

    // result
    expect(steps).toEqual([{ fromId: 'a', segmentId: 's1', toId: 'a' }]);
  });

  it('should return null for a single unit that doesn’t close back on itself', () => {
    // mock
    const units = [unit('s1', 'a', 'b')];
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } };

    // before / result
    expect(chainIntoSteps(units, vertices, planarSegmentsOf(units))).toBeNull();
  });

  it('should return null when the units don’t all connect (a disconnected member breaks the walk)', () => {
    // mock — s2 shares no vertex with s1
    const units = [unit('s1', 'a', 'b'), unit('s2', 'x', 'y')];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 10, y: 0 },
      x: { id: 'x', x: 100, y: 100 },
      y: { id: 'y', x: 110, y: 100 },
    };

    // before / result
    expect(chainIntoSteps(units, vertices, planarSegmentsOf(units))).toBeNull();
  });

  it('should return null when the chain connects but ends open instead of closing back to the start', () => {
    // mock — a->b->c, never returns to "a"
    const units = [unit('s1', 'a', 'b'), unit('s2', 'b', 'c')];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 10, y: 0 },
      c: { id: 'c', x: 5, y: 10 },
    };

    // before / result
    expect(chainIntoSteps(units, vertices, planarSegmentsOf(units))).toBeNull();
  });

  it('should reconstruct a self-touching loop (one shared vertex, two sub-loops) the same way regardless of input order', () => {
    // mock — a figure-eight: two triangles sharing vertex "v" at the origin. A stored loop key only
    // gives an unordered piece set (this is exactly what a self-touching glyph contour like Inter's
    // "e" produces), so "v" has degree 4 here — the real regression this covers.
    const units = [
      unit('s1', 'v', 'p1'),
      unit('s2', 'p1', 'p2'),
      unit('s3', 'p2', 'v'),
      unit('s4', 'v', 'q1'),
      unit('s5', 'q1', 'q2'),
      unit('s6', 'q2', 'v'),
    ];
    const vertices: Record<string, TVectorVertex> = {
      p1: { id: 'p1', x: 10, y: 0 },
      p2: { id: 'p2', x: 0, y: -10 },
      q1: { id: 'q1', x: -10, y: 0 },
      q2: { id: 'q2', x: 0, y: 10 },
      v: { id: 'v', x: 0, y: 0 },
    };
    const allIds = units.map((u) => u.id);
    const shuffledOrders = [units, [...units].reverse(), [units[3], units[4], units[5], units[0], units[1], units[2]]];

    shuffledOrders.forEach((orderedUnits) => {
      // before
      const steps = chainIntoSteps(orderedUnits, vertices, planarSegmentsOf(orderedUnits));

      // result — every unit used exactly once, and consecutive steps genuinely connect end-to-end
      expect(steps).not.toBeNull();
      expect(steps!.map((step) => step.segmentId).sort()).toEqual([...allIds].sort());
      steps!.forEach((step, index) => {
        const next = steps![(index + 1) % steps!.length];
        expect(step.toId).toBe(next.fromId);
      });
    });
  });

  it('should backtrack past a premature self-closure at a self-touching vertex instead of giving up — the real-world "e" glyph regression', () => {
    // mock — the same figure-eight as above, but with "p1" angularly placed just past "p2" (from
    // v's point of view) instead of on the far side near "q2": at the shared vertex "v", walking
    // twin-1 from the arriving piece "s3" now lands on "s1" (this loop's OWN first unit) BEFORE it
    // reaches "s4" (the real continuation). Taking that first match closes the walk back to
    // startKey after only 3 of the 6 units — a valid-looking but incomplete loop a plain greedy walk
    // has no way to recover from. This is exactly what made a real self-crossing glyph (Inter's "e")
    // non-deterministically lose its own face: whichever piece key's random id happened to sort
    // first decided which vertex the walk started from, and for an unlucky starting point the first
    // candidate tried was this kind of dead end.
    const units = [
      unit('s1', 'v', 'p1'),
      unit('s2', 'p1', 'p2'),
      unit('s3', 'p2', 'v'),
      unit('s4', 'v', 'q1'),
      unit('s5', 'q1', 'q2'),
      unit('s6', 'q2', 'v'),
    ];
    const vertices: Record<string, TVectorVertex> = {
      p1: { id: 'p1', x: -2, y: -10 },
      p2: { id: 'p2', x: 0, y: -10 },
      q1: { id: 'q1', x: -10, y: 0 },
      q2: { id: 'q2', x: 0, y: 10 },
      v: { id: 'v', x: 0, y: 0 },
    };

    // before
    const steps = chainIntoSteps(units, vertices, planarSegmentsOf(units));

    // result — recovers the full 6-unit loop instead of returning null on the premature 3-unit closure
    expect(steps).not.toBeNull();
    expect(steps!.map((step) => step.segmentId).sort()).toEqual(['s1', 's2', 's3', 's4', 's5', 's6']);
    steps!.forEach((step, index) => {
      const next = steps![(index + 1) % steps!.length];
      expect(step.toId).toBe(next.fromId);
    });
  });

  it('should skip past a foreign edge from a different, separately-resolved face sharing the same vertex — the "x" crossing case', () => {
    // mock — a real closed triangle a->v->b->a. Vertex "v" has degree 4: s1 (arriving) and s2
    // (departing) belong to our loop, but f1/f2 are a completely different face's own boundary
    // crossing through that exact same point (e.g. the other diagonal stroke of an "x"). f1/f2 are
    // NOT part of `units` at all — chainIntoSteps only ever knows about them through
    // `planarSegments`, and must never treat either as a real step of this loop.
    const units = [unit('s1', 'a', 'v'), unit('s2', 'v', 'b'), unit('s3', 'b', 'a')];
    const foreignPieces = [straightPiece('f1', 'left', 'v'), straightPiece('f2', 'v', 'right')];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: -10, y: -10 },
      b: { id: 'b', x: 10, y: -10 },
      left: { id: 'left', x: -10, y: 10 },
      right: { id: 'right', x: 10, y: 10 },
      v: { id: 'v', x: 0, y: 0 },
    };
    const planarSegments = { ...planarSegmentsOf(units), ...Object.fromEntries(foreignPieces.map((piece) => [piece.id, piece])) };

    // before
    const steps = chainIntoSteps(units, vertices, planarSegments);

    // result — closes back through s1/s2/s3 only, never touching f1/f2
    expect(steps).toEqual([
      { fromId: 'a', segmentId: 's1', toId: 'v' },
      { fromId: 'v', segmentId: 's2', toId: 'b' },
      { fromId: 'b', segmentId: 's3', toId: 'a' },
    ]);
  });
});
