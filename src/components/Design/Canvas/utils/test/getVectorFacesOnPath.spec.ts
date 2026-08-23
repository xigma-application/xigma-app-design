// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFacesOnPath } from '../getVectorFacesOnPath';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: '#000000',
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

describe('getVectorFacesOnPath', () => {
  it('should return the face when a single-point path (a plain click) lands inside it', () => {
    // result
    expect(getVectorFacesOnPath(triangleNode, [{ x: 50, y: 40 }])).toHaveLength(1);
  });

  it('should return the face when any point along a multi-point path lands inside it, not just the first', () => {
    // result
    const faces = getVectorFacesOnPath(triangleNode, [
      { x: 900, y: 900 },
      { x: 50, y: 40 },
      { x: 900, y: 900 },
    ]);

    expect(faces).toHaveLength(1);
  });

  it('should return no faces when every point on the path misses the shape', () => {
    // result
    expect(getVectorFacesOnPath(triangleNode, [{ x: 900, y: 900 }])).toEqual([]);
  });

  it('should return no faces for an empty path', () => {
    // result
    expect(getVectorFacesOnPath(triangleNode, [])).toEqual([]);
  });
});
