// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorHandlesInRect } from '../getVectorHandlesInRect';

const node: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
};

// s1 selected directly makes both its ends visible (§10 rule 1), so the tests below that aren't
// specifically about the visibility gate itself can use this to isolate the geometric hit-test claim
const SEGMENT_VISIBLE = { oneHopVertexIds: [], selectedHandles: [], selectedSegmentIds: ['s1'], selectedVertexIds: [] };

describe('getVectorHandlesInRect', () => {
  it('should return the start handle when its position falls inside the rect and it is visible', () => {
    // action — s1's tangentStart handle sits at (5, 0)
    const result = getVectorHandlesInRect(
      node,
      { height: 4, width: 4, x: 3, y: -2 },
      SEGMENT_VISIBLE.selectedVertexIds,
      SEGMENT_VISIBLE.oneHopVertexIds,
      SEGMENT_VISIBLE.selectedSegmentIds,
      SEGMENT_VISIBLE.selectedHandles,
    );

    // result
    expect(result).toEqual([{ end: 'start', segmentId: 's1' }]);
  });

  it('should return the end handle when its position falls inside the rect and it is visible', () => {
    // action — s1's tangentEnd handle sits at (95, 0)
    const result = getVectorHandlesInRect(
      node,
      { height: 4, width: 4, x: 93, y: -2 },
      SEGMENT_VISIBLE.selectedVertexIds,
      SEGMENT_VISIBLE.oneHopVertexIds,
      SEGMENT_VISIBLE.selectedSegmentIds,
      SEGMENT_VISIBLE.selectedHandles,
    );

    // result
    expect(result).toEqual([{ end: 'end', segmentId: 's1' }]);
  });

  it('should return both handles when a wide rect covers both and both are visible', () => {
    // action
    const result = getVectorHandlesInRect(
      node,
      { height: 4, width: 100, x: 0, y: -2 },
      SEGMENT_VISIBLE.selectedVertexIds,
      SEGMENT_VISIBLE.oneHopVertexIds,
      SEGMENT_VISIBLE.selectedSegmentIds,
      SEGMENT_VISIBLE.selectedHandles,
    );

    // result
    expect(result).toEqual([
      { end: 'start', segmentId: 's1' },
      { end: 'end', segmentId: 's1' },
    ]);
  });

  it('should return an empty array when the rect misses every handle', () => {
    // action
    const result = getVectorHandlesInRect(
      node,
      { height: 4, width: 4, x: 900, y: 900 },
      SEGMENT_VISIBLE.selectedVertexIds,
      SEGMENT_VISIBLE.oneHopVertexIds,
      SEGMENT_VISIBLE.selectedSegmentIds,
      SEGMENT_VISIBLE.selectedHandles,
    );

    // result
    expect(result).toEqual([]);
  });

  it('should skip an end whose effective tangent is null (a straight segment has no handle position to hit)', () => {
    // mock
    const straightNode: TVectorNode = {
      ...node,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    };

    // action
    const result = getVectorHandlesInRect(
      straightNode,
      { height: 200, width: 200, x: -100, y: -100 },
      SEGMENT_VISIBLE.selectedVertexIds,
      SEGMENT_VISIBLE.oneHopVertexIds,
      SEGMENT_VISIBLE.selectedSegmentIds,
      SEGMENT_VISIBLE.selectedHandles,
    );

    // result
    expect(result).toEqual([]);
  });

  it('should NOT catch a handle whose position falls inside the rect but which is not currently visible — nothing selected at all', () => {
    // action — the same box that would catch the start handle in the first test, but with an empty
    // selection this time: the handle is never rendered, so a marquee sweeping over it must not select it
    const result = getVectorHandlesInRect(node, { height: 4, width: 4, x: 3, y: -2 }, [], [], [], []);

    // result
    expect(result).toEqual([]);
  });

  it('should catch a handle made visible via its own parent vertex being directly selected', () => {
    // action — v1 selected directly makes s1's own tangentStart handle visible (its parent vertex)
    const result = getVectorHandlesInRect(node, { height: 4, width: 4, x: 3, y: -2 }, ['v1'], [], [], []);

    // result
    expect(result).toEqual([{ end: 'start', segmentId: 's1' }]);
  });

  it('should catch a handle made visible via the one-hop vertex list', () => {
    // action — same handle, this time visible only through the one-hop expansion
    const result = getVectorHandlesInRect(node, { height: 4, width: 4, x: 3, y: -2 }, [], ['v1'], [], []);

    // result
    expect(result).toEqual([{ end: 'start', segmentId: 's1' }]);
  });

  it('should catch a handle that is already individually selected, even with nothing else selected', () => {
    // action
    const result = getVectorHandlesInRect(node, { height: 4, width: 4, x: 3, y: -2 }, [], [], [], [{ end: 'start', segmentId: 's1' }]);

    // result
    expect(result).toEqual([{ end: 'start', segmentId: 's1' }]);
  });
});
