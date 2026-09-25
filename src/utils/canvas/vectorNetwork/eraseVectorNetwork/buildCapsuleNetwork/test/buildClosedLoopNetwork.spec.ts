// utils
import { buildClosedLoopNetwork } from '../buildClosedLoopNetwork';

describe('buildClosedLoopNetwork', () => {
  it('should build one vertex per point and straight segments closing the loop', () => {
    // before
    const { segments, vertices } = buildClosedLoopNetwork([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
    const vertexList = Object.values(vertices);
    const segmentList = Object.values(segments);

    // result
    expect(vertexList.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
    expect(segmentList).toHaveLength(3);
    segmentList.forEach((segment, index) => {
      expect(segment).toMatchObject({
        endId: vertexList[(index + 1) % 3].id,
        startId: vertexList[index].id,
        tangentEnd: null,
        tangentStart: null,
      });
      expect(segments[segment.id]).toBe(segment);
    });
  });
});
