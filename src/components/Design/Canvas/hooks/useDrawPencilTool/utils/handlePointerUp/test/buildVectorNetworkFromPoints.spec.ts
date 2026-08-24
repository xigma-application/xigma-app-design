// utils
import { buildVectorNetworkFromPoints } from '../buildVectorNetworkFromPoints';

describe('buildVectorNetworkFromPoints', () => {
  it('should create one vertex per point, all in symmetric handle mode', () => {
    // mock
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ];

    // before
    const { vertexHandleModes, vertices } = buildVectorNetworkFromPoints(points, 0.5);
    const vertexList = Object.values(vertices);

    // result
    expect(vertexList).toHaveLength(3);
    expect(vertexList.map((vertex) => ({ x: vertex.x, y: vertex.y }))).toEqual(points);
    expect(Object.values(vertexHandleModes).every((mode) => mode === 'symmetric')).toBe(true);
  });

  it('should chain one segment between each consecutive pair of vertices, in stroke order', () => {
    // mock
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ];

    // before
    const { segments, vertices } = buildVectorNetworkFromPoints(points, 0.5);
    const findVertexId = (point: { x: number; y: number }): string =>
      Object.keys(vertices).find((id) => vertices[id].x === point.x && vertices[id].y === point.y) as string;
    const segmentList = Object.values(segments);

    // result
    expect(segmentList).toHaveLength(2);
    expect(segmentList[0]).toMatchObject({ endId: findVertexId(points[1]), startId: findVertexId(points[0]) });
    expect(segmentList[1]).toMatchObject({ endId: findVertexId(points[2]), startId: findVertexId(points[1]) });
  });

  it('should sign-mirror the shared tangent between two adjoining segments at their common vertex', () => {
    // mock — the middle vertex (index 1) gets one tangent value from getCatmullRomTangents (whatever
    // its raw-or-clamped magnitude ends up being); the first segment's tangentEnd (incoming, at that
    // vertex) must be the exact negation of the second segment's tangentStart (outgoing, at that same
    // vertex) — both must derive from that one shared tangent, not be computed independently
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ];

    // before
    const { segments } = buildVectorNetworkFromPoints(points, 0.5);
    const [firstSegment, secondSegment] = Object.values(segments);
    const sharedTangent = secondSegment.tangentStart as { x: number; y: number };

    // result
    expect(sharedTangent).not.toEqual({ x: 0, y: 0 });
    expect(firstSegment.tangentEnd).toEqual({ x: -sharedTangent.x, y: -sharedTangent.y });
  });

  it('should return empty segments for a single point (nothing to connect)', () => {
    // before
    const { segments, vertices } = buildVectorNetworkFromPoints([{ x: 5, y: 5 }], 0.5);

    // result
    expect(Object.keys(vertices)).toHaveLength(1);
    expect(Object.keys(segments)).toHaveLength(0);
  });
});
