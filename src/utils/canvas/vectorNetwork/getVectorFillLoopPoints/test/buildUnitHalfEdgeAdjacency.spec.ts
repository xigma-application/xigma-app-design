// types
import { TResolvedPieceUnit } from '../types';
import { TVectorVertex } from 'types/design/types';

// utils
import { buildUnitHalfEdgeAdjacency } from '../buildUnitHalfEdgeAdjacency';

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

describe('buildUnitHalfEdgeAdjacency', () => {
  it('should add two directed half-edges per unit, one for each traversal direction, keyed by fromId', () => {
    // mock
    const units = [unit('s1', 'a', 'b')];
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before
    const adjacency = buildUnitHalfEdgeAdjacency(units, vertices);

    // result
    expect(adjacency.get('a')).toEqual([{ segmentId: 's1', toId: 'b' }]);
    expect(adjacency.get('b')).toEqual([{ segmentId: 's1', toId: 'a' }]);
  });

  it('should sort multiple half-edges at a shared vertex by their real departure angle, not by unit id', () => {
    // mock — from "a", straight up to "north" (90°) and straight right to "east" (0°); "z1" sorts
    // after "a1" alphabetically, but east's angle is smaller, so it must still come first
    const units = [unit('z1', 'a', 'north'), unit('a1', 'a', 'east')];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      east: { id: 'east', x: 10, y: 0 },
      north: { id: 'north', x: 0, y: 10 },
    };

    // before
    const adjacency = buildUnitHalfEdgeAdjacency(units, vertices);

    // result
    expect(adjacency.get('a')).toEqual([
      { segmentId: 'a1', toId: 'east' },
      { segmentId: 'z1', toId: 'north' },
    ]);
  });

  it('should compute a departing unit’s angle from its own adjacent real piece, not the unit’s far endpoint', () => {
    // mock — a two-piece unit "u1" from "a" to "c" via "b"; the departure angle from "a" must use
    // piece p1 (a->b), not a straight line from a to c
    const twoPieceUnit: TResolvedPieceUnit = {
      endId: 'c',
      id: 'u1',
      pieces: [straightPiece('p1', 'a', 'b'), straightPiece('p2', 'b', 'c')],
      startId: 'a',
    };
    const units = [twoPieceUnit, unit('u2', 'a', 'east')];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 0, y: 10 },
      c: { id: 'c', x: -10, y: 10 },
      east: { id: 'east', x: 10, y: 0 },
    };

    // before
    const adjacency = buildUnitHalfEdgeAdjacency(units, vertices);

    // result — u1 departs "a" toward b (90°, north), u2 departs toward east (0°) — east sorts first
    expect(adjacency.get('a')).toEqual([
      { segmentId: 'u2', toId: 'east' },
      { segmentId: 'u1', toId: 'c' },
    ]);
  });
});
