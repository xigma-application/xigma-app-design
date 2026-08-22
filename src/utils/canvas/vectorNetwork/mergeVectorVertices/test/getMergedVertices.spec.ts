// utils
import { getMergedVertices } from '../getMergedVertices';

describe('getMergedVertices', () => {
  it('should drop the target vertex, keeping the source vertex and any others', () => {
    // mock
    const node = {
      filledFaceKeys: [],
      segments: {},
      vertexHandleModes: {},
      vertices: { other: { id: 'other', x: 0, y: 0 }, source: { id: 'source', x: 10, y: 10 }, target: { id: 'target', x: 10, y: 0 } },
    };

    // before
    const vertices = getMergedVertices(node, node, 'target');

    // result
    expect(vertices).toEqual({ other: { id: 'other', x: 0, y: 0 }, source: { id: 'source', x: 10, y: 10 } });
  });

  it('should combine both nodes’ vertices, keyed by id', () => {
    // mock
    const sourceNode = {
      filledFaceKeys: [],
      segments: {},
      vertexHandleModes: {},
      vertices: { source: { id: 'source', x: 10, y: 0 } },
    };
    const targetNode = {
      filledFaceKeys: [],
      segments: {},
      vertexHandleModes: {},
      vertices: { b: { id: 'b', x: 20, y: 0 }, target: { id: 'target', x: 10, y: 0 } },
    };

    // before
    const vertices = getMergedVertices(sourceNode, targetNode, 'target');

    // result
    expect(vertices).toEqual({ b: { id: 'b', x: 20, y: 0 }, source: { id: 'source', x: 10, y: 0 } });
  });
});
