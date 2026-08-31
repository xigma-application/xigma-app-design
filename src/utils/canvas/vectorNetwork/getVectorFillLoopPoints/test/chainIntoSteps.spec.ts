// types
import { TResolvedPieceUnit } from '../types';
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
    const steps = chainIntoSteps(units, vertices);

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
    const steps = chainIntoSteps(units, vertices);

    // result
    expect(steps).toEqual([{ fromId: 'a', segmentId: 's1', toId: 'a' }]);
  });

  it('should return null for a single unit that doesn’t close back on itself', () => {
    // mock
    const units = [unit('s1', 'a', 'b')];
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } };

    // before / result
    expect(chainIntoSteps(units, vertices)).toBeNull();
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
    expect(chainIntoSteps(units, vertices)).toBeNull();
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
    expect(chainIntoSteps(units, vertices)).toBeNull();
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
      v: { id: 'v', x: 0, y: 0 },
      p1: { id: 'p1', x: 10, y: 0 },
      p2: { id: 'p2', x: 0, y: -10 },
      q1: { id: 'q1', x: -10, y: 0 },
      q2: { id: 'q2', x: 0, y: 10 },
    };
    const allIds = units.map((u) => u.id);
    const shuffledOrders = [units, [...units].reverse(), [units[3], units[4], units[5], units[0], units[1], units[2]]];

    shuffledOrders.forEach((orderedUnits) => {
      // before
      const steps = chainIntoSteps(orderedUnits, vertices);

      // result — every unit used exactly once, and consecutive steps genuinely connect end-to-end
      expect(steps).not.toBeNull();
      expect(steps!.map((step) => step.segmentId).sort()).toEqual([...allIds].sort());
      steps!.forEach((step, index) => {
        const next = steps![(index + 1) % steps!.length];
        expect(step.toId).toBe(next.fromId);
      });
    });
  });
});
