// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getSegmentPolyline } from '../getSegmentPolyline';

const node = (): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    curved: { endId: 'v3', id: 'curved', startId: 'v2', tangentEnd: { x: 0, y: 40 }, tangentStart: { x: 40, y: 0 } },
    straight: { endId: 'v2', id: 'straight', startId: 'v1', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 200, y: 100 } },
});

describe('getSegmentPolyline', () => {
  it('should return the two endpoints for a straight segment', () => {
    expect(getSegmentPolyline(node(), 'straight')).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ]);
  });

  it('should return a multi-point sampling for a curved segment', () => {
    const polyline = getSegmentPolyline(node(), 'curved');

    expect(polyline.length).toBeGreaterThan(2);
    expect(polyline[0]).toEqual({ x: 100, y: 0 });
    expect(polyline[polyline.length - 1]).toEqual({ x: 200, y: 100 });
  });

  it('should return an empty polyline for an unknown segment id', () => {
    expect(getSegmentPolyline(node(), 'nope')).toEqual([]);
  });
});
