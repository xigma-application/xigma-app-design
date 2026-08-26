// utils
import { getVectorHandleHitForNode } from '../getVectorHandleHitForNode';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

const buildNode = (): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
});

describe('getVectorHandleHitForNode', () => {
  it('should hit the tangentStart handle when its vertex is visually selected', () => {
    const node = buildNode();

    const result = getVectorHandleHitForNode(node, { x: 5, y: 0 }, 1, ['v1'], [], []);

    expect(result).toEqual({ distance: 0, end: 'start', segmentId: 's1', vertexId: 'v1' });
  });

  it('should return null when the handle is not visible, even though its position falls within tolerance', () => {
    const node = buildNode();

    const result = getVectorHandleHitForNode(node, { x: 5, y: 0 }, 1, [], [], []);

    expect(result).toBeNull();
  });
});
