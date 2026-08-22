// utils
import { getMergedSegments } from '../getMergedSegments';

describe('getMergedSegments', () => {
  it('should retarget a segment endpoint referencing the target vertex onto the source vertex', () => {
    // mock
    const node = {
      filledFaceKeys: [],
      segments: { s1: { endId: 'target', id: 's1', startId: 'other', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: {},
    };

    // before
    const segments = getMergedSegments(node, node, 'source', 'target');

    // result
    expect(segments).toEqual({ s1: { endId: 'source', id: 's1', startId: 'other', tangentEnd: null, tangentStart: null } });
  });

  it('should drop a segment that becomes a self-loop once both its endpoints retarget to the same vertex', () => {
    // mock — source and target were directly connected
    const node = {
      filledFaceKeys: [],
      segments: { s1: { endId: 'target', id: 's1', startId: 'source', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: {},
    };

    // before
    const segments = getMergedSegments(node, node, 'source', 'target');

    // result
    expect(segments).toEqual({});
  });

  it('should combine both nodes’ segments, keyed by id, retargeting only the absorbed node’s target references', () => {
    // mock
    const sourceNode = {
      filledFaceKeys: [],
      segments: { sA: { endId: 'other', id: 'sA', startId: 'source', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: {},
    };
    const targetNode = {
      filledFaceKeys: [],
      segments: { s1: { endId: 'b', id: 's1', startId: 'target', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: {},
    };

    // before
    const segments = getMergedSegments(sourceNode, targetNode, 'source', 'target');

    // result
    expect(segments).toEqual({
      s1: { endId: 'b', id: 's1', startId: 'source', tangentEnd: null, tangentStart: null },
      sA: { endId: 'other', id: 'sA', startId: 'source', tangentEnd: null, tangentStart: null },
    });
  });

  it('should leave tangent offsets untouched when retargeting an endpoint', () => {
    // mock
    const node = {
      filledFaceKeys: [],
      segments: {
        s1: { endId: 'target', id: 's1', startId: 'other', tangentEnd: { x: 5, y: 5 }, tangentStart: { x: -5, y: -5 } },
      },
      vertexHandleModes: {},
      vertices: {},
    };

    // before
    const segments = getMergedSegments(node, node, 'source', 'target');

    // result
    expect(segments.s1).toMatchObject({ tangentEnd: { x: 5, y: 5 }, tangentStart: { x: -5, y: -5 } });
  });
});
