// utils
import { persistVectorNetworkCrossings } from '../persistVectorNetworkCrossings';

describe('persistVectorNetworkCrossings', () => {
  it('should return the same segments/vertices references when there are no crossings', () => {
    // mock — a plain triangle, no self-crossings
    const segments = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 50, y: 100 } };

    // before
    const result = persistVectorNetworkCrossings(segments, vertices);

    // result
    expect(result.segments).toBe(segments);
    expect(result.vertices).toBe(vertices);
  });

  it('should split two crossing segments around one shared, real vertex per crossing', () => {
    // mock — a square plus a separate line crossing its left and right edges
    const segments = {
      line1: { endId: 'p2', id: 'line1', startId: 'p1', tangentEnd: null, tangentStart: null },
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
      s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
    };
    const vertices = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 100, y: 0 },
      c: { id: 'c', x: 100, y: 100 },
      d: { id: 'd', x: 0, y: 100 },
      p1: { id: 'p1', x: -20, y: 50 },
      p2: { id: 'p2', x: 120, y: 50 },
    };

    // before
    const result = persistVectorNetworkCrossings(segments, vertices);

    // result
    const newVertexIds = Object.keys(result.vertices).filter((id) => !(id in vertices));

    expect(newVertexIds).toHaveLength(2);
    newVertexIds.forEach((id) => {
      expect(id).not.toContain(':');
      expect(result.vertices[id].y).toBeCloseTo(50);
    });

    expect(Object.keys(result.segments).sort()).toEqual(
      ['s1', 's2#0', 's2#1', 's3', 's4#0', 's4#1', 'line1#0', 'line1#1', 'line1#2'].sort(),
    );

    // the crossing on s4 (left edge) and the matching crossing on line1 share one real vertex id
    const s4After = result.segments['s4#0'].endId;
    const line1FirstCrossing = result.segments['line1#0'].endId;

    expect(s4After).toBe(line1FirstCrossing);
  });
});
