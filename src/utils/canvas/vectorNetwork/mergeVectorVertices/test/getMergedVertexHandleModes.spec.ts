// utils
import { getMergedVertexHandleModes } from '../getMergedVertexHandleModes';

describe('getMergedVertexHandleModes', () => {
  it('should drop the target’s handle mode entry, keeping the source’s own entry untouched', () => {
    // mock
    const node = {
      filledFaceKeys: [],
      segments: {},
      vertexHandleModes: { source: 'smooth' as const, target: 'symmetric' as const },
      vertices: {},
    };

    // before
    const vertexHandleModes = getMergedVertexHandleModes(node, node, 'target');

    // result
    expect(vertexHandleModes).toEqual({ source: 'smooth' });
  });

  it('should combine both nodes’ handle modes, keyed by vertex id', () => {
    // mock
    const sourceNode = { filledFaceKeys: [], segments: {}, vertexHandleModes: { source: 'smooth' as const }, vertices: {} };
    const targetNode = { filledFaceKeys: [], segments: {}, vertexHandleModes: { target: 'symmetric' as const }, vertices: {} };

    // before
    const vertexHandleModes = getMergedVertexHandleModes(sourceNode, targetNode, 'target');

    // result
    expect(vertexHandleModes).toEqual({ source: 'smooth' });
  });
});
