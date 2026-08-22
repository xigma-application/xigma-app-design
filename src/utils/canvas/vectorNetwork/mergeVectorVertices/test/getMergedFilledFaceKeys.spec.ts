// utils
import { getMergedFilledFaceKeys } from '../getMergedFilledFaceKeys';

describe('getMergedFilledFaceKeys', () => {
  it('should drop a filled-face key that referenced a segment pruned by the merge', () => {
    // mock — "s1" was the sole boundary of a painted face, but no longer exists in the merged segments
    const node = {
      filledFaceKeys: ['s1[v:source|v:target]'],
      segments: {},
      vertexHandleModes: {},
      vertices: {},
    };

    // before
    const filledFaceKeys = getMergedFilledFaceKeys(node, node, {});

    // result
    expect(filledFaceKeys).toEqual([]);
  });

  it('should combine both nodes’ filled-face keys when the merge doesn’t prune their segments', () => {
    // mock
    const sourceNode = { filledFaceKeys: ['sA[v:other|v:source]'], segments: {}, vertexHandleModes: {}, vertices: {} };
    const targetNode = { filledFaceKeys: ['s1[v:b|v:target]'], segments: {}, vertexHandleModes: {}, vertices: {} };
    const mergedSegments = {
      s1: { endId: 'b', id: 's1', startId: 'source', tangentEnd: null, tangentStart: null },
      sA: { endId: 'other', id: 'sA', startId: 'source', tangentEnd: null, tangentStart: null },
    };

    // before
    const filledFaceKeys = getMergedFilledFaceKeys(sourceNode, targetNode, mergedSegments);

    // result
    expect(filledFaceKeys).toEqual(['sA[v:other|v:source]', 's1[v:b|v:target]']);
  });

  it('should deduplicate an identical key present on both nodes', () => {
    // mock
    const node = {
      filledFaceKeys: ['s1[v:a|v:b]'],
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: {},
    };

    // before
    const filledFaceKeys = getMergedFilledFaceKeys(node, node, node.segments);

    // result
    expect(filledFaceKeys).toEqual(['s1[v:a|v:b]']);
  });

  it('should keep a multi-piece key only when every one of its pieces’ real segment ids still exists', () => {
    // mock — "s2" is missing from the merged segments, so the whole loop key is dropped even though "s1" survives
    const node = {
      filledFaceKeys: ['s1[v:a|v:b],s2[v:b|v:c]'],
      segments: {},
      vertexHandleModes: {},
      vertices: {},
    };
    const mergedSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };

    // before
    const filledFaceKeys = getMergedFilledFaceKeys(node, node, mergedSegments);

    // result
    expect(filledFaceKeys).toEqual([]);
  });
});
