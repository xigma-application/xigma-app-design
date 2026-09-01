// types
import { TResolvedPieceUnit } from '../../types';
import { TVectorHalfEdge } from '../../../buildVectorHalfEdgeAdjacency';

// utils
import { getNextUnitHalfEdgeCandidates } from '../getNextUnitHalfEdge';

const straightPiece = (id: string, startId: string, endId: string): TResolvedPieceUnit['pieces'][number] => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const unit = (id: string, startId: string, endId: string, pieceIds: string[] = [id]): TResolvedPieceUnit => {
  const innerIds = [startId, ...pieceIds.slice(0, -1).map((_, index) => `${id}-mid-${index}`), endId];

  return {
    endId,
    id,
    pieces: pieceIds.map((pieceId, index) => straightPiece(pieceId, innerIds[index], innerIds[index + 1])),
    startId,
  };
};

const boundaryUnitsById = (...units: TResolvedPieceUnit[]): Map<string, TResolvedPieceUnit> => {
  const map = new Map<string, TResolvedPieceUnit>();

  units.forEach((u) => {
    map.set(u.pieces[0].id, u);
    map.set(u.pieces[u.pieces.length - 1].id, u);
  });

  return map;
};

describe('getNextUnitHalfEdgeCandidates', () => {
  it('should continue the loop through the next unit, walking from its startId to its endId', () => {
    // mock — triangle a->b->c->a, currently having just walked s1 from "a" to "b"
    const currentUnit = unit('s1', 'a', 'b');
    const nextUnit = unit('s2', 'b', 'c');
    const fullAdjacency = new Map<string, TVectorHalfEdge[]>([
      [
        'b',
        [
          { segmentId: 's1', toId: 'a' },
          { segmentId: 's2', toId: 'c' },
        ],
      ],
    ]);

    // before
    const candidates = getNextUnitHalfEdgeCandidates(fullAdjacency, boundaryUnitsById(currentUnit, nextUnit), 'a', 'b', currentUnit);

    // result
    expect(candidates).toEqual([{ segmentId: 's2', toId: 'c' }]);
  });

  it('should walk a candidate unit backwards (toId to startId) when arrived at its endId side', () => {
    // mock — s3 runs m->b, but we arrive at "b" from its end, so the departure point is its startId "m"
    const currentUnit = unit('s1', 'a', 'b');
    const nextUnit = unit('s3', 'm', 'b');
    const fullAdjacency = new Map<string, TVectorHalfEdge[]>([
      [
        'b',
        [
          { segmentId: 's1', toId: 'a' },
          { segmentId: 's3', toId: 'm' },
        ],
      ],
    ]);

    // before
    const candidates = getNextUnitHalfEdgeCandidates(fullAdjacency, boundaryUnitsById(currentUnit, nextUnit), 'a', 'b', currentUnit);

    // result
    expect(candidates).toEqual([{ segmentId: 's3', toId: 'm' }]);
  });

  it('should skip a foreign half-edge that belongs to no known unit', () => {
    // mock — "f1" crosses through "b" but isn't part of any resolved unit (e.g. another face's edge)
    const currentUnit = unit('s1', 'a', 'b');
    const nextUnit = unit('s2', 'b', 'c');
    const fullAdjacency = new Map<string, TVectorHalfEdge[]>([
      [
        'b',
        [
          { segmentId: 's1', toId: 'a' },
          { segmentId: 'f1', toId: 'z' },
          { segmentId: 's2', toId: 'c' },
        ],
      ],
    ]);

    // before
    const candidates = getNextUnitHalfEdgeCandidates(fullAdjacency, boundaryUnitsById(currentUnit, nextUnit), 'a', 'b', currentUnit);

    // result
    expect(candidates).toEqual([{ segmentId: 's2', toId: 'c' }]);
  });

  it('should return no candidates when the arriving piece has no twin recorded at the destination vertex', () => {
    // mock — "b" has adjacency, but none of it is the piece we supposedly just arrived on
    const currentUnit = unit('s1', 'a', 'b');
    const fullAdjacency = new Map<string, TVectorHalfEdge[]>([['b', [{ segmentId: 's2', toId: 'c' }]]]);

    // before / result
    expect(getNextUnitHalfEdgeCandidates(fullAdjacency, boundaryUnitsById(currentUnit), 'a', 'b', currentUnit)).toEqual([]);
  });

  it('should return no candidates when the destination vertex has no recorded adjacency at all', () => {
    // mock — an empty adjacency map, e.g. a vertex that belongs to no planar segment
    const currentUnit = unit('s1', 'a', 'b');
    const fullAdjacency = new Map<string, TVectorHalfEdge[]>();

    // before / result
    expect(getNextUnitHalfEdgeCandidates(fullAdjacency, boundaryUnitsById(currentUnit), 'a', 'b', currentUnit)).toEqual([]);
  });

  it('should use the unit’s first piece as the arriving edge when walking it back from its endId', () => {
    // mock — s1 is a 2-piece unit a-(p1)->m-(p2)->b; walking it in reverse (arriving fromId "b") means
    // the piece that lands on the shared vertex "a" is its first piece "p1", not its last "p2"
    const currentUnit = unit('s1', 'a', 'b', ['p1', 'p2']);
    const nextUnit = unit('s4', 'a', 'd');
    const fullAdjacency = new Map<string, TVectorHalfEdge[]>([
      [
        'a',
        [
          { segmentId: 'p1', toId: 'm' },
          { segmentId: 's4', toId: 'd' },
        ],
      ],
    ]);

    // before
    const candidates = getNextUnitHalfEdgeCandidates(fullAdjacency, boundaryUnitsById(currentUnit, nextUnit), 'b', 'a', currentUnit);

    // result
    expect(candidates).toEqual([{ segmentId: 's4', toId: 'd' }]);
  });
});
