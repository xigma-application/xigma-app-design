// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getOpenVectorEndpoints } from '../getOpenVectorEndpoints';

const baseNode: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#00ff00',
  strokeWidth: 2,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('getOpenVectorEndpoints', () => {
  it('should return no endpoints when the node has isolated vertices untouched by any segment', () => {
    // mock
    const node: TVectorNode = {
      ...baseNode,
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    };

    // before
    const result = getOpenVectorEndpoints(node);

    // result
    expect(result).toEqual([]);
  });

  it('should return only the endpoints touched by exactly one segment on an open polyline', () => {
    // mock — v1 - v2 - v3, an open path: v1 and v3 are endpoints, v2 is interior (touched twice)
    const node: TVectorNode = {
      ...baseNode,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 20, y: 0 } },
    };

    // before
    const result = getOpenVectorEndpoints(node);

    // result
    expect(result.sort()).toEqual(['v1', 'v3']);
  });

  it('should return no endpoints for a closed loop, since every vertex is touched by exactly two segments', () => {
    // mock — a closed triangle: v1 - v2 - v3 - v1
    const node: TVectorNode = {
      ...baseNode,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 5, y: 10 } },
    };

    // before
    const result = getOpenVectorEndpoints(node);

    // result
    expect(result).toEqual([]);
  });
});
