// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorHandleAtPoint } from '../getVectorHandleAtPoint';

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

describe('getVectorHandleAtPoint', () => {
  it('should return the closer handle when both the start and end handles are within tolerance', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -6, y: 0 }, tangentStart: { x: 1, y: 0 } } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 0, y: 0 }, node, 5, ['v1', 'v2'], [], [], []);

    // result
    expect(hit).toEqual({ distance: 1, end: 'start', segmentId: 's1', vertexId: 'v1' });
  });

  it('should return null when neither the start nor end tangent is set', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 0, y: 0 }, node, 5, ['v1', 'v2'], [], [], []);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when a handle exists but lies outside the tolerance', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 100, y: 0 } } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 0, y: 0 }, node, 5, ['v1', 'v2'], [], [], []);

    // result
    expect(hit).toBeNull();
  });

  it('should return the start handle when only the start tangent is set', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 0 } } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 2, y: 0 }, node, 1, ['v1', 'v2'], [], [], []);

    // result
    expect(hit).toEqual({ distance: 0, end: 'start', segmentId: 's1', vertexId: 'v1' });
  });

  it('should return the default start handle when only the end tangent is set, without it landing on the end handle', () => {
    // mock — v1(0,0) -> v2(10,0), tangentEnd (-2,0); default start handle lands at v1 + (1,0), not on the end handle
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -2, y: 0 }, tangentStart: null } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 1, y: 0 }, node, 1, ['v1', 'v2'], [], [], []);

    // result
    expect(hit).toEqual({ distance: 0, end: 'start', segmentId: 's1', vertexId: 'v1' });
  });

  it('should return the end handle when only the end tangent is set', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -2, y: 0 }, tangentStart: null } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 8, y: 0 }, node, 1, ['v1', 'v2'], [], [], []);

    // result
    expect(hit).toEqual({ distance: 0, end: 'end', segmentId: 's1', vertexId: 'v2' });
  });

  it('should return null for a handle whose segment has no selected endpoint and which is not itself selected', () => {
    // mock — same handle as above, but neither v1, v2, nor the handle itself is part of the current selection
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 0 } } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 2, y: 0 }, node, 1, [], [], [], []);

    // result
    expect(hit).toBeNull();
  });

  it('should return a handle that is itself selected even when neither of its segment’s endpoints is', () => {
    // mock — the handle was selected directly (e.g. a previous click), which alone must keep it hittable
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 0 } } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 2, y: 0 }, node, 1, [], [], [{ end: 'start', segmentId: 's1' }], []);

    // result
    expect(hit).toEqual({ distance: 0, end: 'start', segmentId: 's1', vertexId: 'v1' });
  });

  it('should return the start handle (attached to v1) when v2 is directly selected — a directly-touching segment always reveals both ends', () => {
    // mock — v2 is one of segment s1's own two endpoints, so both ends show unconditionally (confirmed
    // directly: "Tak, zawsze — dla każdego segmentu dotykającego P")
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 0 } } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 2, y: 0 }, node, 1, ['v2'], [], [], []);

    // result
    expect(hit).toEqual({ distance: 0, end: 'start', segmentId: 's1', vertexId: 'v1' });
  });

  it('should return a handle whose segment is directly selected, even with no vertex/handle selected', () => {
    // mock — same handle as the "no selection at all" case above, but s1 itself is now selected
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 0 } } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 2, y: 0 }, node, 1, [], [], [], ['s1']);

    // result
    expect(hit).toEqual({ distance: 0, end: 'start', segmentId: 's1', vertexId: 'v1' });
  });

  it('should return the own-end handle of a vertex reached one hop away through a straight connector, but not the far end of that same segment', () => {
    // mock — v1 -s1(real tangent)- v2 -s2(straight)- v3 chain; selecting v3 reaches v2 one hop away (through the
    // straight s2), which reveals v2's own default-preview handle on s1's tangentEnd side (v2 + default offset
    // (-1,0) = (9,0)) — but s1 does not directly touch v3, so v1's own handle (0,0)+(2,0)=(2,0) on the far side
    // of that same segment must stay hidden (this is the one-hop-by-vertex, not one-hop-by-segment, distinction)
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 20, y: 0 } },
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 0 } },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
    );

    // action — v3 selected; v2 is the one-hop neighbor via straight s2
    const hitOwnEnd = getVectorHandleAtPoint({ x: 9, y: 0 }, node, 1, ['v3'], ['v3', 'v2'], [], []);
    const hitFarEnd = getVectorHandleAtPoint({ x: 2, y: 0 }, node, 1, ['v3'], ['v3', 'v2'], [], []);

    // result
    expect(hitOwnEnd).toEqual({ distance: 0, end: 'end', segmentId: 's1', vertexId: 'v2' });
    expect(hitFarEnd).toBeNull();
  });
});
