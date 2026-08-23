// types
import { TVectorNetworkComponent } from '../types';

// utils
import { addCutClosingSegment } from '../addCutClosingSegment';

describe('addCutClosingSegment', () => {
  it('should add a closing segment and a resolvable filledFaceKeys entry when the piece has exactly 2 open ends', () => {
    // mock — an open half-square: a-b-c-d chain, a and d are the open ends, both created by this cut,
    // both on the boundary of the one original face that used to fill the whole square
    const component: TVectorNetworkComponent = {
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 100, y: 100 },
        d: { id: 'd', x: 0, y: 100 },
      },
    };

    // before
    const result = addCutClosingSegment(
      component,
      { a: 0, d: 1 },
      ['left[x|y],right[x|y]'],
      [
        { lineT: 0, point: { x: 0, y: 0 }, segmentId: 'left', t: 0.5 },
        { lineT: 1, point: { x: 0, y: 100 }, segmentId: 'right', t: 0.5 },
      ],
    );

    // result — one new segment closing a<->d, and a real, non-empty fill key
    expect(Object.keys(result.segments)).toHaveLength(4);
    const closingSegment = Object.values(result.segments).find((segment) => !['s1', 's2', 's3'].includes(segment.id))!;

    expect([closingSegment.startId, closingSegment.endId].sort()).toEqual(['a', 'd']);
    expect(result.filledFaceKeys).toHaveLength(1);
    expect(result.filledFaceKeys![0]).toContain('[');
  });

  it("should pair up open ends face-by-face, not two unrelated faces' crossings together", () => {
    // mock — a 4-spoke star (h-a, h-b, h-c, h-d, no outer ring); face1 borders only a/b, face2 borders
    // only c/d — they don't share a real segment, so pairing must stay (a,b) and (c,d), never (b,c)
    const component: TVectorNetworkComponent = {
      segments: {
        s1: { endId: 'a', id: 's1', startId: 'h', tangentEnd: null, tangentStart: null },
        s2: { endId: 'b', id: 's2', startId: 'h', tangentEnd: null, tangentStart: null },
        s3: { endId: 'c', id: 's3', startId: 'h', tangentEnd: null, tangentStart: null },
        s4: { endId: 'd', id: 's4', startId: 'h', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 100, y: 100 },
        d: { id: 'd', x: 0, y: 100 },
        h: { id: 'h', x: 50, y: 50 },
      },
    };

    // before — deliberately unsorted input order; pairing must follow lineT, not object key order
    const result = addCutClosingSegment(
      component,
      { a: 0, b: 1, c: 2, d: 3 },
      ['segA[x|y]', 'segB[x|y]'],
      [
        { lineT: 0, point: { x: 0, y: 0 }, segmentId: 'segA', t: 0.5 },
        { lineT: 1, point: { x: 100, y: 0 }, segmentId: 'segA', t: 0.5 },
        { lineT: 2, point: { x: 100, y: 100 }, segmentId: 'segB', t: 0.5 },
        { lineT: 3, point: { x: 0, y: 100 }, segmentId: 'segB', t: 0.5 },
      ],
    );

    // result — two new closing segments (a-b and c-d), and two resolvable face keys, one per triangle
    expect(Object.keys(result.segments)).toHaveLength(6);
    expect(result.filledFaceKeys).toHaveLength(2);
    result.filledFaceKeys!.forEach((key) => expect(key).toContain('['));

    const closingSegments = Object.values(result.segments).filter((segment) => !['s1', 's2', 's3', 's4'].includes(segment.id));
    const closingPairs = closingSegments.map((segment) => [segment.startId, segment.endId].sort());

    expect(closingPairs).toContainEqual(['a', 'b']);
    expect(closingPairs).toContainEqual(['c', 'd']);
  });

  it('should close all three gaps when three original faces share crossed segments in a chain (regression: the middle face used to be dropped)', () => {
    // mock — same 4-spoke star, but now three ADJACENT original faces share real segments pairwise:
    // face1 borders a's segment and b's segment, face2 borders b's segment and c's segment, face3
    // borders c's segment and d's segment — mirrors a shape cut through 3 side-by-side filled regions
    // (e.g. a roofline split into left/middle/right faces). Global closest-pair-first pairing across all
    // 4 open ends at once would only produce (a,b) and (c,d), silently losing face2's own gap (b,c).
    const component: TVectorNetworkComponent = {
      segments: {
        s1: { endId: 'a', id: 's1', startId: 'h', tangentEnd: null, tangentStart: null },
        s2: { endId: 'b', id: 's2', startId: 'h', tangentEnd: null, tangentStart: null },
        s3: { endId: 'c', id: 's3', startId: 'h', tangentEnd: null, tangentStart: null },
        s4: { endId: 'd', id: 's4', startId: 'h', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 100, y: 100 },
        d: { id: 'd', x: 0, y: 100 },
        h: { id: 'h', x: 50, y: 50 },
      },
    };

    // before — segB (crossed at b, lineT 1) borders both face1 and face2; segC (crossed at c, lineT 2)
    // borders both face2 and face3
    const result = addCutClosingSegment(
      component,
      { a: 0, b: 1, c: 2, d: 3 },
      ['segA[x|y],segB[x|y]', 'segB[p|q],segC[p|q]', 'segC[m|n],segD[m|n]'],
      [
        { lineT: 0, point: { x: 0, y: 0 }, segmentId: 'segA', t: 0.5 },
        { lineT: 1, point: { x: 100, y: 0 }, segmentId: 'segB', t: 0.5 },
        { lineT: 2, point: { x: 100, y: 100 }, segmentId: 'segC', t: 0.5 },
        { lineT: 3, point: { x: 0, y: 100 }, segmentId: 'segD', t: 0.5 },
      ],
    );

    // result — three closing segments (a-b, b-c, c-d), b and c each taking part in two of them, and
    // three resolvable faces (h-a-b, h-b-c, h-c-d)
    const closingSegments = Object.values(result.segments).filter((segment) => !['s1', 's2', 's3', 's4'].includes(segment.id));
    const closingPairs = closingSegments.map((segment) => [segment.startId, segment.endId].sort());

    expect(closingSegments).toHaveLength(3);
    expect(closingPairs).toContainEqual(['a', 'b']);
    expect(closingPairs).toContainEqual(['b', 'c']);
    expect(closingPairs).toContainEqual(['c', 'd']);
    expect(result.filledFaceKeys).toHaveLength(3);
  });

  it('should leave an already-closed loop untouched, with no filledFaceKeys change', () => {
    // mock — a-b-c-a triangle, no open ends
    const component: TVectorNetworkComponent = {
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 100, y: 100 } },
    };

    // before
    const result = addCutClosingSegment(component, {}, [], []);

    // result
    expect(result).toBe(component);
  });

  it('should leave a branching, odd-open-end piece untouched (an odd count can never be paired up)', () => {
    // mock — a "Y" shape with three open ends, all created by this cut, all on the same original face
    const component: TVectorNetworkComponent = {
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'b', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 200, y: 0 },
        d: { id: 'd', x: 100, y: 100 },
      },
    };

    // before
    const result = addCutClosingSegment(
      component,
      { a: 0, c: 1, d: 2 },
      ['segA[x|y],segC[x|y],segD[x|y]'],
      [
        { lineT: 0, point: { x: 0, y: 0 }, segmentId: 'segA', t: 0.5 },
        { lineT: 1, point: { x: 200, y: 0 }, segmentId: 'segC', t: 0.5 },
        { lineT: 2, point: { x: 100, y: 100 }, segmentId: 'segD', t: 0.5 },
      ],
    );

    // result
    expect(result).toBe(component);
  });

  it('should leave a piece untouched when some of its open ends predate this cut (not every open end has a known line position)', () => {
    // mock — a-b-c chain; only "a" was created by this cut, "c" was already an open end beforehand
    const component: TVectorNetworkComponent = {
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 200, y: 0 } },
    };

    // before — only "a" is in vertexLineT, "c" isn't (it was already open before this cut ran)
    const result = addCutClosingSegment(
      component,
      { a: 0 },
      ['segA[x|y]'],
      [{ lineT: 0, point: { x: 0, y: 0 }, segmentId: 'segA', t: 0.5 }],
    );

    // result
    expect(result).toBe(component);
  });
});
