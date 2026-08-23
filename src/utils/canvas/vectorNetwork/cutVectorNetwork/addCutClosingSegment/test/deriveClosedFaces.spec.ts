// utils
import { deriveClosedFaces } from '../deriveClosedFaces';

describe('deriveClosedFaces', () => {
  it('should derive the closed faces of the given segments', () => {
    // mock — a closed triangle a-b-c-a
    const segments = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    };
    const component = {
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 100, y: 100 } },
    };

    // before
    const result = deriveClosedFaces(segments, component);

    // result
    expect(result).toHaveLength(1);
    expect(result[0].pieceKeys.sort()).toEqual(['s1[v:a|v:b]', 's2[v:b|v:c]', 's3[v:a|v:c]']);
  });
});
