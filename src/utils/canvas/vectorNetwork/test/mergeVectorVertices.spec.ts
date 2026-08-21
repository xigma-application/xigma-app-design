// utils
import { mergeVectorVertices } from '../mergeVectorVertices';

describe('mergeVectorVertices', () => {
  it('should retarget a segment referencing the target vertex onto the source vertex, within the same node', () => {
    // mock — target is source's only other neighbour, connected through an unrelated segment
    const node = {
      filledFaceKeys: [],
      segments: { s1: { endId: 'target', id: 's1', startId: 'other', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { other: { id: 'other', x: 0, y: 0 }, source: { id: 'source', x: 10, y: 10 }, target: { id: 'target', x: 10, y: 0 } },
    };

    // before
    const merged = mergeVectorVertices(node, node, 'source', 'target');

    // result
    expect(merged.vertices).toEqual({ other: { id: 'other', x: 0, y: 0 }, source: { id: 'source', x: 10, y: 10 } });
    expect(merged.segments).toEqual({ s1: { endId: 'source', id: 's1', startId: 'other', tangentEnd: null, tangentStart: null } });
  });

  it('should drop a segment that becomes a self-loop when the source and target were directly connected', () => {
    // mock — source and target are already joined by a direct segment
    const node = {
      filledFaceKeys: [],
      segments: { s1: { endId: 'target', id: 's1', startId: 'source', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { source: { id: 'source', x: 0, y: 0 }, target: { id: 'target', x: 10, y: 0 } },
    };

    // before
    const merged = mergeVectorVertices(node, node, 'source', 'target');

    // result
    expect(merged.segments).toEqual({});
    expect(merged.vertices).toEqual({ source: { id: 'source', x: 0, y: 0 } });
  });

  it('should drop a filled-face key that referenced a segment pruned by the merge', () => {
    // mock — same self-loop setup as above, but "s1" was also the sole boundary of a painted face
    const node = {
      filledFaceKeys: ['s1'],
      segments: { s1: { endId: 'target', id: 's1', startId: 'source', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { source: { id: 'source', x: 0, y: 0 }, target: { id: 'target', x: 10, y: 0 } },
    };

    // before
    const merged = mergeVectorVertices(node, node, 'source', 'target');

    // result
    expect(merged.filledFaceKeys).toEqual([]);
  });

  it('should leave tangent offsets untouched when retargeting a segment endpoint', () => {
    // mock
    const node = {
      filledFaceKeys: [],
      segments: {
        s1: { endId: 'target', id: 's1', startId: 'other', tangentEnd: { x: 5, y: 5 }, tangentStart: { x: -5, y: -5 } },
      },
      vertexHandleModes: {},
      vertices: { other: { id: 'other', x: 0, y: 0 }, source: { id: 'source', x: 10, y: 10 }, target: { id: 'target', x: 10, y: 0 } },
    };

    // before
    const merged = mergeVectorVertices(node, node, 'source', 'target');

    // result
    expect(merged.segments.s1).toMatchObject({ tangentEnd: { x: 5, y: 5 }, tangentStart: { x: -5, y: -5 } });
  });

  it('should drop the target’s handle mode entry, keeping the source’s own entry untouched', () => {
    // mock
    const node = {
      filledFaceKeys: [],
      segments: {},
      vertexHandleModes: { source: 'smooth' as const, target: 'symmetric' as const },
      vertices: { source: { id: 'source', x: 0, y: 0 }, target: { id: 'target', x: 10, y: 0 } },
    };

    // before
    const merged = mergeVectorVertices(node, node, 'source', 'target');

    // result
    expect(merged.vertexHandleModes).toEqual({ source: 'smooth' });
  });

  it('should combine two different nodes’ vertices/segments/handle modes, retargeting the absorbed node’s segments onto the surviving vertex', () => {
    // mock — sourceNode is the surviving node (its own vertex, "source", already snapped onto target's position);
    // targetNode is the absorbed shape, connected internally via "target" and an unrelated vertex "b"
    const sourceNode = {
      filledFaceKeys: [],
      segments: {},
      vertexHandleModes: { source: 'smooth' as const },
      vertices: { source: { id: 'source', x: 10, y: 0 } },
    };
    const targetNode = {
      filledFaceKeys: [],
      segments: { s1: { endId: 'b', id: 's1', startId: 'target', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: { target: 'symmetric' as const },
      vertices: { b: { id: 'b', x: 20, y: 0 }, target: { id: 'target', x: 10, y: 0 } },
    };

    // before
    const merged = mergeVectorVertices(sourceNode, targetNode, 'source', 'target');

    // result
    expect(merged.vertices).toEqual({ b: { id: 'b', x: 20, y: 0 }, source: { id: 'source', x: 10, y: 0 } });
    expect(merged.segments).toEqual({ s1: { endId: 'b', id: 's1', startId: 'source', tangentEnd: null, tangentStart: null } });
    expect(merged.vertexHandleModes).toEqual({ source: 'smooth' });
  });

  it('should carry over both nodes’ filled-face keys when a cross-node merge doesn’t prune their segments', () => {
    // mock — targetNode has a painted face keyed by "s1", the segment that survives absorption unchanged;
    // sourceNode already had an unrelated face of its own painted, keyed by "sA"
    const sourceNode = {
      filledFaceKeys: ['sA'],
      segments: { sA: { endId: 'other', id: 'sA', startId: 'source', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { other: { id: 'other', x: 0, y: 5 }, source: { id: 'source', x: 10, y: 0 } },
    };
    const targetNode = {
      filledFaceKeys: ['s1'],
      segments: { s1: { endId: 'b', id: 's1', startId: 'target', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { b: { id: 'b', x: 20, y: 0 }, target: { id: 'target', x: 10, y: 0 } },
    };

    // before
    const merged = mergeVectorVertices(sourceNode, targetNode, 'source', 'target');

    // result
    expect(merged.filledFaceKeys).toEqual(['sA', 's1']);
  });
});
