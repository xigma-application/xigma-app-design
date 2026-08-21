// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorSegmentMidpointAtPoint } from '../getVectorSegmentMidpointAtPoint';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: '#000000',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

describe('getVectorSegmentMidpointAtPoint', () => {
  it('should hit the segment whose own midpoint falls within tolerance', () => {
    // mock — v1(0,0)-v2(100,0), straight, own midpoint at (50,0)
    const node = buildNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    // before
    const hit = getVectorSegmentMidpointAtPoint({ x: 50, y: 0 }, node, 5);

    // result
    expect(hit).toEqual({ segmentId: 's1' });
  });

  it('should return null when the point is on the segment but far from its own midpoint', () => {
    // mock — same segment, point sits near v1's own end instead of the midpoint
    const node = buildNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    // before
    const hit = getVectorSegmentMidpointAtPoint({ x: 5, y: 0 }, node, 5);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when no segment midpoint is within tolerance', () => {
    // mock
    const node = buildNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    // before
    const hit = getVectorSegmentMidpointAtPoint({ x: 900, y: 900 }, node, 5);

    // result
    expect(hit).toBeNull();
  });

  it('should return the closest midpoint when two segments’ midpoints are both within tolerance', () => {
    // mock — s1's midpoint at (50,0), s2's midpoint at (52,0), both within a generous tolerance of (51,0)
    const node = buildNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 100, y: 0 },
        v3: { id: 'v3', x: 50, y: 4 },
        v4: { id: 'v4', x: 54, y: 4 },
      },
    );

    // before
    const hit = getVectorSegmentMidpointAtPoint({ x: 51, y: 0 }, node, 10);

    // result — s1's midpoint (50,0) is closer to (51,0) than s2's (52,4)
    expect(hit).toEqual({ segmentId: 's1' });
  });
});
