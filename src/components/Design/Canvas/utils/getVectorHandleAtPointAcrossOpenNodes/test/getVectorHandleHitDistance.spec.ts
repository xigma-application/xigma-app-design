// utils
import { getVectorHandleHitDistance } from '../getVectorHandleHitDistance';

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
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
});

describe('getVectorHandleHitDistance', () => {
  it('should measure the distance to the start handle position', () => {
    const node = buildNode();

    const distance = getVectorHandleHitDistance(node, { end: 'start', segmentId: 's1', vertexId: 'v1' }, { x: 8, y: 0 });

    expect(distance).toBe(3);
  });

  it('should measure the distance to the end handle position', () => {
    const node = buildNode();

    const distance = getVectorHandleHitDistance(node, { end: 'end', segmentId: 's1', vertexId: 'v2' }, { x: 2, y: 0 });

    expect(distance).toBe(3);
  });
});
