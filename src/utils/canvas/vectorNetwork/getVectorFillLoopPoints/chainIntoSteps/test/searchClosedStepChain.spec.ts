// types
import { TResolvedPieceUnit } from '../../types';
import { TSearchContext } from '../types';
import { TVectorVertex } from 'types/design/types';

// utils
import { buildVectorHalfEdgeAdjacency } from '../../../buildVectorHalfEdgeAdjacency';
import { searchClosedStepChain } from '../searchClosedStepChain';

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

const contextFor = (units: TResolvedPieceUnit[], vertices: Record<string, TVectorVertex>, budgetRemaining = 20000): TSearchContext => {
  const [first] = units;
  const unitById = new Map(units.map((u) => [u.id, u]));
  const unitByBoundaryPieceId = new Map<string, TResolvedPieceUnit>();

  units.forEach((u) => {
    unitByBoundaryPieceId.set(u.pieces[0].id, u);
    unitByBoundaryPieceId.set(u.pieces[u.pieces.length - 1].id, u);
  });

  return {
    budget: { remaining: budgetRemaining },
    fullAdjacency: buildVectorHalfEdgeAdjacency(
      units.flatMap((u) => u.pieces),
      vertices,
    ),
    startKey: `${first.id}:${first.startId}`,
    unitById,
    unitByBoundaryPieceId,
    unitsCount: units.length,
  };
};

describe('searchClosedStepChain', () => {
  it('should find the closing step chain around a simple triangle', () => {
    // mock — a(0,0)->b(10,0)->c(5,10)->a
    const units = [unit('s1', 'a', 'b'), unit('s2', 'b', 'c'), unit('s3', 'c', 'a')];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 10, y: 0 },
      c: { id: 'c', x: 5, y: 10 },
    };
    const context = contextFor(units, vertices);

    // before
    const steps = searchClosedStepChain('a', 'b', 's1', new Set(), [], context);

    // result
    expect(steps).toEqual([
      { fromId: 'a', segmentId: 's1', toId: 'b' },
      { fromId: 'b', segmentId: 's2', toId: 'c' },
      { fromId: 'c', segmentId: 's3', toId: 'a' },
    ]);
  });

  it('should return null once every candidate at a dead end has been exhausted', () => {
    // mock — a single unit that never closes back on its own start, so the walk runs out of candidates
    const units = [unit('s1', 'a', 'b'), unit('s2', 'x', 'y')];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 10, y: 0 },
      x: { id: 'x', x: 100, y: 100 },
      y: { id: 'y', x: 110, y: 100 },
    };
    const context = contextFor(units, vertices);

    // before / result
    expect(searchClosedStepChain('a', 'b', 's1', new Set(), [], context)).toBeNull();
  });

  it('should return null as soon as the search budget is exhausted, before ever taking a step', () => {
    // mock — same closable triangle as above, but with no budget left to explore it
    const units = [unit('s1', 'a', 'b'), unit('s2', 'b', 'c'), unit('s3', 'c', 'a')];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 10, y: 0 },
      c: { id: 'c', x: 5, y: 10 },
    };
    const context = contextFor(units, vertices, 0);

    // before / result
    expect(searchClosedStepChain('a', 'b', 's1', new Set(), [], context)).toBeNull();
  });

  it('should backtrack past a premature self-closure at a self-touching vertex instead of giving up', () => {
    // mock — a figure-eight: two triangles sharing vertex "v". Walking twin-1 from the arriving piece
    // "s3" lands back on "s1" (this loop's own first unit) BEFORE reaching "s4" (the real
    // continuation), so the first closure attempt only uses 3 of the 6 units and must be rejected.
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
      p1: { id: 'p1', x: -2, y: -10 },
      p2: { id: 'p2', x: 0, y: -10 },
      q1: { id: 'q1', x: -10, y: 0 },
      q2: { id: 'q2', x: 0, y: 10 },
    };
    const context = contextFor(units, vertices);

    // before
    const steps = searchClosedStepChain('v', 'p1', 's1', new Set(), [], context);

    // result — recovers the full 6-unit loop instead of returning null on the premature 3-unit closure
    expect(steps).not.toBeNull();
    expect(steps!.map((step) => step.segmentId).sort()).toEqual(['s1', 's2', 's3', 's4', 's5', 's6']);
    steps!.forEach((step, index) => {
      const next = steps![(index + 1) % steps!.length];
      expect(step.toId).toBe(next.fromId);
    });
  });
});
