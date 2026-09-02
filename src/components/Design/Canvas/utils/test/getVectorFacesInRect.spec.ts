// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFacesInRect } from '../getVectorFacesInRect';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#ffffff',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

const triangleNode = buildNode(
  {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
    s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
  },
  { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
);

describe('getVectorFacesInRect', () => {
  it('should return the face when the rect fully contains it (a face point falls inside the rect)', () => {
    // result
    expect(getVectorFacesInRect(triangleNode, { height: 200, width: 200, x: -50, y: -50 })).toHaveLength(1);
  });

  it('should return the face when a small rect sits entirely inside it, touching no vertex (a rect corner falls inside the face)', () => {
    // result
    expect(getVectorFacesInRect(triangleNode, { height: 10, width: 10, x: 45, y: 40 })).toHaveLength(1);
  });

  it('should return no faces when the rect misses the shape entirely', () => {
    // result
    expect(getVectorFacesInRect(triangleNode, { height: 10, width: 10, x: 900, y: 900 })).toEqual([]);
  });
});
