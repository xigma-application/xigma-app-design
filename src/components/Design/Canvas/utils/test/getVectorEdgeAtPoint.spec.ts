// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorEdgeAtPoint } from '../getVectorEdgeAtPoint';

const buildNode = (vertices: Record<string, TVectorVertex>, segments: Record<string, TVectorSegment>): TVectorNode => ({
  fillColor: '#000000',
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

describe('getVectorEdgeAtPoint', () => {
  it('should return the segment id when the point lies near the interior of a straight edge', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorEdgeAtPoint({ x: 5, y: 0.5 }, node, 2, 1);

    // result — also reports the closest point projected onto the edge, for hover attraction; right on
    // the midpoint here (5, 0), so it also counts as snapped, which locks the reported curve parameter to
    // exactly 0.5 too (used by the Pen tool to split the segment at exactly this point)
    expect(hit).toEqual({ point: { x: 5, y: 0 }, segmentId: 's1', snapped: true, t: 0.5 });
  });

  it('should report the continuous projected point, not snapped, when hovering the interior away from the midpoint', () => {
    // mock — v1(0,0)-v2(10,0), midpoint (5,0); hovering near x=8, well outside the midpoint's snap radius
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorEdgeAtPoint({ x: 8, y: 0.5 }, node, 2, 1);

    // result — the raw projected point (8, 0), unsnapped, since it's outside the vertexTolerance(1) radius
    // around the midpoint; t=0.8 matches its position 80% of the way along the (single, unflattened) edge
    expect(hit).toEqual({ point: { x: 8, y: 0 }, segmentId: 's1', snapped: false, t: 0.8 });
  });

  it('should snap fully onto the exact midpoint once the projected point is close enough to it', () => {
    // mock — v1(0,0)-v2(10,0), midpoint (5,0); hovering a bit off it, but within the snap radius
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action — projects onto (5.5, 0), within vertexTolerance(1) of the (5,0) midpoint
    const hit = getVectorEdgeAtPoint({ x: 5.5, y: 0.5 }, node, 2, 1);

    // result — locks onto the exact midpoint (5, 0), not the raw projection (5.5, 0); t locks to exactly
    // 0.5 too, not the raw projection's 0.55
    expect(hit).toEqual({ point: { x: 5, y: 0 }, segmentId: 's1', snapped: true, t: 0.5 });
  });

  it('should return null when the point is near the end vertex of an edge instead of its interior', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorEdgeAtPoint({ x: 9.5, y: 0 }, node, 2, 1);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when the point is near the start vertex of an edge instead of its interior', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorEdgeAtPoint({ x: 0.5, y: 0 }, node, 2, 1);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when the point is far from every edge and vertex', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorEdgeAtPoint({ x: 100, y: 100 }, node, 2, 1);

    // result
    expect(hit).toBeNull();
  });
});
