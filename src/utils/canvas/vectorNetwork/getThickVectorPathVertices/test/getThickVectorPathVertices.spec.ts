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

  it('should fill every wedge around a branch vertex touched by 3+ segment ends with a bevel fan, instead of leaving a gap', () => {
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

    // result — 3 segment quads (12 numbers each) + a 3-triangle bevel fan around v1 (6 numbers each,
    // one per angularly-adjacent pair: s1→s2 is collinear and degenerates to zero area, s2→s3 and
    // s3→s1 each fill a real 90deg wedge)
    expect(vertices).toHaveLength(54);

    const fan = vertices.slice(36);
    const expectedFan = [0, 0, 0, -1, 0, -1, 0, 0, 0, 1, 1, 0, 0, 0, -1, 0, 0, 1];

    fan.forEach((value, index) => expect(value).toBeCloseTo(expectedFan[index]));
  });

  it('should fill the wedge between exactly 2 segment ends that are both outgoing (no natural incoming/outgoing pair) with a bevel fan too', () => {
    // mock — two segments both start from v1; there's no "arriving at v1" side for the sharp-miter
    // path, so this falls back to the same bevel fan as a branch vertex, just with only 2 segments
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

    // result — 2 segment quads (12 numbers each) + a 2-triangle bevel fan around v1 (6 numbers each)
    expect(vertices).toHaveLength(36);

    const fan = vertices.slice(24);
    const expectedFan = [0, 0, 0, 1, 1, 0, 0, 0, -1, 0, 0, -1];

    fan.forEach((value, index) => expect(value).toBeCloseTo(expectedFan[index]));
  });
});
