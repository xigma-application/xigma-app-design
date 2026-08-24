// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorCutHitAtPoint } from '../getVectorCutHitAtPoint';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

describe('getVectorCutHitAtPoint', () => {
  it('should resolve a mid-segment click to its own t value, away from either endpoint', () => {
    // mock — a(0,0)->b(100,0), clicked near its own midpoint
    const node = buildNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    // before
    const hit = getVectorCutHitAtPoint({ x: 50, y: 0 }, node, 5, 5);

    // result
    expect(hit).toMatchObject({ segmentId: 's1' });
    expect(hit!.t).toBeCloseTo(0.5, 2);
  });

  it("should snap t to 0 when the click lands on the segment's own existing start vertex", () => {
    // mock — this is the exact case getVectorEdgeAtPoint.ts deliberately excludes; Cut needs it resolved
    const node = buildNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    // before
    const hit = getVectorCutHitAtPoint({ x: 0, y: 0 }, node, 5, 5);

    // result
    expect(hit).toEqual({ point: { x: 0, y: 0 }, segmentId: 's1', t: 0 });
  });

  it("should snap t to 1 when the click lands on the segment's own existing end vertex", () => {
    // mock
    const node = buildNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    // before
    const hit = getVectorCutHitAtPoint({ x: 100, y: 0 }, node, 5, 5);

    // result
    expect(hit).toEqual({ point: { x: 100, y: 0 }, segmentId: 's1', t: 1 });
  });

  it('should resolve a click near a branch vertex to whichever of its segments is closest', () => {
    // mock — vertex "b" shared by s1 (a-b) and s2 (b-c), click sits closer to s2's own endpoint side
    const node = buildNode(
      {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      },
      { a: { id: 'a', x: -100, y: 0 }, b: { id: 'b', x: 0, y: 0 }, c: { id: 'c', x: 100, y: 0 } },
    );

    // before
    const hit = getVectorCutHitAtPoint({ x: 0, y: 0 }, node, 5, 5);

    // result — both s1 (t=1) and s2 (t=0) resolve at exactly zero distance; either is a legitimate,
    // deterministic pick (Array.prototype.sort is stable, so the first-declared segment wins ties)
    expect(hit!.point).toEqual({ x: 0, y: 0 });
    expect(hit!.t === 0 || hit!.t === 1).toBe(true);
  });

  it('should resolve a click near the apex of a curved segment to its true closest point, not the first tessellated sample', () => {
    // mock — a(0,0)->b(100,0) bowed upward via tangents, apex sits at t=0.5, (50,75); an unbounded
    // tolerance means every tessellated sample would pass a naive "first within tolerance" check,
    // so this only passes if the search finds the globally closest sample instead
    const node = buildNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: { x: 0, y: 100 }, tangentStart: { x: 0, y: 100 } } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    // before
    const hit = getVectorCutHitAtPoint({ x: 50, y: 75 }, node, Number.POSITIVE_INFINITY, 5);

    // result
    expect(hit).toMatchObject({ segmentId: 's1' });
    expect(hit!.t).toBeCloseTo(0.5, 1);
    expect(hit!.point.x).toBeCloseTo(50, 0);
    expect(hit!.point.y).toBeCloseTo(75, 0);
  });

  it('should return null when the click misses every segment', () => {
    // mock
    const node = buildNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    // before
    const hit = getVectorCutHitAtPoint({ x: 500, y: 500 }, node, 5, 5);

    // result
    expect(hit).toBeNull();
  });
});
