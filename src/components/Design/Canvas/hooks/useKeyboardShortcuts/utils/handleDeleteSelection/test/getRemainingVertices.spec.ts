// utils
import { getRemainingVertices } from '../getRemainingVertices';

describe('getRemainingVertices', () => {
  it('should drop a vertex that no remaining segment touches', () => {
    // mock
    const vertices = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 }, v3: { id: 'v3', x: 20, y: 20 } };
    const segments = { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } };

    // before
    const result = getRemainingVertices(vertices, segments);

    // result — v3 touches no remaining segment
    expect(result).toEqual({ v1: vertices.v1, v2: vertices.v2 });
  });

  it('should keep every vertex when each is still touched by a segment', () => {
    // mock
    const vertices = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 } };
    const segments = { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } };

    // before
    const result = getRemainingVertices(vertices, segments);

    // result
    expect(result).toEqual(vertices);
  });

  it('should return an empty object when there are no segments left at all', () => {
    // mock
    const vertices = { v1: { id: 'v1', x: 0, y: 0 } };

    // before
    const result = getRemainingVertices(vertices, {});

    // result
    expect(result).toEqual({});
  });
});
