// utils
import { getClusterFlattenedEdges } from '../getClusterFlattenedEdges';

const planar = {
  segments: {
    curved: { endId: 'c', id: 'curved', startId: 'b', tangentEnd: { x: 0, y: 20 }, tangentStart: { x: 20, y: 0 } },
    straight: { endId: 'b', id: 'straight', startId: 'a', tangentEnd: null, tangentStart: null },
  },
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 10, y: 10 } },
};

describe('getClusterFlattenedEdges', () => {
  it('should turn a straight segment into edges running from its start to its end along the line', () => {
    // before
    const edges = getClusterFlattenedEdges({ key: 'k', segmentIds: ['straight'], vertexIds: [] }, planar);

    // result
    expect(edges[0][0]).toMatchObject({ x: 0, y: 0 });
    expect(edges[edges.length - 1][1]).toMatchObject({ x: 10, y: 0 });
    edges.flat().forEach((point) => expect(point.y).toBe(0));
  });

  it('should flatten a curved segment into a chain of connected edges', () => {
    // before
    const edges = getClusterFlattenedEdges({ key: 'k', segmentIds: ['curved'], vertexIds: [] }, planar);

    // result
    expect(edges.length).toBeGreaterThan(1);
    expect(edges[0][0]).toMatchObject({ x: 10, y: 0 });
    expect(edges[edges.length - 1][1]).toMatchObject({ x: 10, y: 10 });
    edges.slice(1).forEach((edge, index) => expect(edge[0]).toBe(edges[index][1]));
  });
});
