// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorVertexAtPoint } from '../getVectorVertexAtPoint';

const buildNode = (vertices: TVectorNode['vertices']): TVectorNode => ({
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

describe('getVectorVertexAtPoint', () => {
  it('should return the closest vertex within tolerance, ahead of a farther one also within tolerance', () => {
    // mock
    const node = buildNode({
      far: { id: 'far', x: 100, y: 0 },
      mid: { id: 'mid', x: 4, y: 0 },
      near: { id: 'near', x: 1, y: 0 },
    });

    // before
    const hit = getVectorVertexAtPoint({ x: 0, y: 0 }, node, 5);

    // result
    expect(hit).toEqual({ vertexId: 'near' });
  });

  it('should return null when no vertex is within tolerance', () => {
    // mock
    const node = buildNode({ v1: { id: 'v1', x: 100, y: 0 } });

    // before
    const hit = getVectorVertexAtPoint({ x: 0, y: 0 }, node, 5);

    // result
    expect(hit).toBeNull();
  });

  it('should exclude the vertex matching excludeId even when it is the closest one', () => {
    // mock
    const node = buildNode({
      near: { id: 'near', x: 1, y: 0 },
      next: { id: 'next', x: 3, y: 0 },
    });

    // before
    const hit = getVectorVertexAtPoint({ x: 0, y: 0 }, node, 5, 'near');

    // result
    expect(hit).toEqual({ vertexId: 'next' });
  });
});
