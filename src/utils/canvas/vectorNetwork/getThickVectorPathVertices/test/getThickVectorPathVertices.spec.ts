// types
import { TFlattenedVectorSegment } from '../../flattenVectorSegments';

// utils
import { getThickVectorPathVertices } from '../getThickVectorPathVertices';

describe('getThickVectorPathVertices', () => {
  it('should join every corner of a closed 4-segment square, including the closing vertex shared by the last and first segments', () => {
    // mock — v1(0,0) -> v2(10,0) -> v3(10,10) -> v4(0,10) -> v1(0,0), each a plain 2-point segment
    const segments: TFlattenedVectorSegment[] = [
      {
        endId: 'v2',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        segmentId: 's1',
        startId: 'v1',
      },
      {
        endId: 'v3',
        points: [
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ],
        segmentId: 's2',
        startId: 'v2',
      },
      {
        endId: 'v4',
        points: [
          { x: 10, y: 10 },
          { x: 0, y: 10 },
        ],
        segmentId: 's3',
        startId: 'v3',
      },
      {
        endId: 'v1',
        points: [
          { x: 0, y: 10 },
          { x: 0, y: 0 },
        ],
        segmentId: 's4',
        startId: 'v4',
      },
    ];

    // before
    const vertices = getThickVectorPathVertices(segments, 1);

    // result — 4 segment quads (12 numbers each) + 4 corner join quads (12 numbers each), one per
    // vertex, including the closing corner (v1) where segment 4's end meets segment 1's start
    expect(vertices).toHaveLength(96);

    // result — the closing corner (v1) is the first join emitted (vertices are grouped by first
    // sighting, and v1 is first seen as segment 1's own start): a sharp miter connecting s4's
    // incoming offset (1,0) with s1's outgoing offset (0,1), meeting at (-1,-1) — up-and-left of v1,
    // the correct outward direction for the square's top-left corner — toBeCloseTo per number, not
    // toEqual: -dy/length can floating-point round to -0 for an axis-aligned offset
    const v1Join = vertices.slice(48, 60);
    const expectedV1Join = [0, 0, -1, 0, -1, -1, 0, 0, -1, -1, 0, -1];

    v1Join.forEach((value, index) => expect(value).toBeCloseTo(expectedV1Join[index]));
  });

  it('should not join a vertex touched by only one segment end (an open path’s own endpoint)', () => {
    // mock — a single open segment: v1 and v2 are each touched by exactly one segment end
    const segments: TFlattenedVectorSegment[] = [
      {
        endId: 'v2',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        segmentId: 's1',
        startId: 'v1',
      },
    ];

    // before
    const vertices = getThickVectorPathVertices(segments, 1);

    // result — just the one segment quad, no join vertices appended
    expect(vertices).toHaveLength(12);
  });

  it('should join every wedge around a branch vertex touched by 3+ segment ends, mitering only the one wedge left uncovered by every other arm', () => {
    // mock — v1 is the shared endpoint of three segments (a "T" branch: s1/s2 are collinear, s3
    // sticks up perpendicular) — this is exactly the shape a Pen-tool user gets by extending a new
    // segment from an existing corner, and every wedge around v1 must be covered, not just one pair
    const segments: TFlattenedVectorSegment[] = [
      {
        endId: 'v1',
        points: [
          { x: -10, y: 0 },
          { x: 0, y: 0 },
        ],
        segmentId: 's1',
        startId: 'v0',
      },
      {
        endId: 'v2',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        segmentId: 's2',
        startId: 'v1',
      },
      {
        endId: 'v3',
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 10 },
        ],
        segmentId: 's3',
        startId: 'v1',
      },
    ];

    // before
    const vertices = getThickVectorPathVertices(segments, 1);

    // result — 3 segment quads (12 numbers each) + a per-wedge join around v1 (12 numbers each): none
    // of this T-branch's 3 wedges is reflex (s1→s2 is the exact-180deg collinear pass-through, s2→s3
    // and s3→s1 are each a plain 90deg wedge already covered by the horizontal arm's own quad), so
    // every one gets a flat bevel — no wedge here needs, or gets, an outward-projecting miter tip
    expect(vertices).toHaveLength(72);

    const fan = vertices.slice(36);
    // prettier-ignore
    const expectedFan = [
      0, 1, 0, 1, 0, -1, 0, 1, 0, -1, 0, -1,
      0, -1, -1, 0, 1, 0, 0, -1, 1, 0, 0, 1,
      1, 0, 0, -1, 0, 1, 1, 0, 0, 1, -1, 0,
    ];

    fan.forEach((value, index) => expect(value).toBeCloseTo(expectedFan[index]));
  });

  it('should miter only the widest (reflex) wedge between exactly 2 segment ends that are both outgoing (no natural incoming/outgoing pair)', () => {
    // mock — two segments both start from v1; there's no "arriving at v1" side for the sharp-miter
    // path, so this reuses the same per-wedge join as the 3+-segment branch case above, just with
    // only 2 arms: the wide (270deg) wedge on the far side gets a real miter, the narrow (90deg) one
    // between the two arms themselves gets a flat bevel
    const segments: TFlattenedVectorSegment[] = [
      {
        endId: 'v2',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        segmentId: 's1',
        startId: 'v1',
      },
      {
        endId: 'v3',
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 10 },
        ],
        segmentId: 's2',
        startId: 'v1',
      },
    ];

    // before
    const vertices = getThickVectorPathVertices(segments, 1);

    // result — 2 segment quads (12 numbers each) + a per-wedge join around v1 (12 numbers each)
    expect(vertices).toHaveLength(48);

    const fan = vertices.slice(24);
    // prettier-ignore
    const expectedFan = [
      0, -1, -1, 0, 1, 0, 0, -1, 1, 0, 0, 1,
      0, 0, -1, 0, -1, -1, 0, 0, -1, -1, 0, -1,
    ];

    fan.forEach((value, index) => expect(value).toBeCloseTo(expectedFan[index]));
  });

  it('should miter a branch vertex whose widest wedge is the exterior one, to a single sharp tip — regression for a reported flat-chamfer bug', () => {
    // mock — v1 is a Figma-style arrowhead: a shaft arrives from the left (s1) and two symmetric
    // diagonal arms leave toward the upper-left/lower-left (s2/s3), same topology as the reported bug
    // (three segments meeting at one point, Ctrl-extended from an existing vertex) — the two wedges
    // between the shaft and each diagonal are real but narrow (90deg), while the third, much wider
    // wedge (between the two diagonals, wrapping the other way around through the tip) is where the
    // old bevel-only fan produced a visible flat notch instead of a point.
    //
    // this also guards the *second* bug this shape exposed: mitering every wedge (not just the
    // reflex one) made the two narrow shaft/diagonal wedges project their own miter past the real
    // tip, at 1+sqrt(2) instead of sqrt(2) — a visibly asymmetric "flag" reported live against a
    // running build, tip pulled off-axis toward one diagonal. Asserting the full fan (not just the
    // tip coordinate) below catches that regression too.
    const segments: TFlattenedVectorSegment[] = [
      {
        endId: 'v1',
        points: [
          { x: -10, y: 0 },
          { x: 0, y: 0 },
        ],
        segmentId: 's1',
        startId: 'v0',
      },
      {
        endId: 'v2',
        points: [
          { x: 0, y: 0 },
          { x: -10, y: -10 },
        ],
        segmentId: 's2',
        startId: 'v1',
      },
      {
        endId: 'v3',
        points: [
          { x: 0, y: 0 },
          { x: -10, y: 10 },
        ],
        segmentId: 's3',
        startId: 'v1',
      },
    ];

    // before
    const vertices = getThickVectorPathVertices(segments, 1);
    const fan = vertices.slice(36);

    // result — the two shaft/diagonal wedges (s1→s2, s3→s1) are plain flat bevels, each bounded
    // within halfWidth of the vertex; only the diagonals' own wedge (s2→s3, emitted last) miters,
    // its tip sitting exactly on the shaft's own axis at sqrt(2) * halfWidth — a single sharp point,
    // neither a flat cut nor an off-axis spike
    // prettier-ignore
    const expectedFan = [
      Math.SQRT1_2, Math.SQRT1_2, 0, -1, 0, 1, Math.SQRT1_2, Math.SQRT1_2, 0, 1, -Math.SQRT1_2, -Math.SQRT1_2,
      0, 1, Math.SQRT1_2, -Math.SQRT1_2, -Math.SQRT1_2, Math.SQRT1_2, 0, 1, -Math.SQRT1_2, Math.SQRT1_2, 0, -1,
      0, 0, Math.SQRT1_2, -Math.SQRT1_2, Math.SQRT2, 0, 0, 0, Math.SQRT2, 0, Math.SQRT1_2, Math.SQRT1_2,
    ];

    fan.forEach((value, index) => expect(value).toBeCloseTo(expectedFan[index]));

    const tipPoint = [fan[28], fan[29]];

    expect(tipPoint[0]).toBeCloseTo(Math.SQRT2);
    expect(tipPoint[1]).toBeCloseTo(0);
  });
});
