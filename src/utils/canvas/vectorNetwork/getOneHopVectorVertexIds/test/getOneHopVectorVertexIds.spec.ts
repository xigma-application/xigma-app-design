// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getOneHopVectorVertexIds } from '../getOneHopVectorVertexIds';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
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

describe('getOneHopVectorVertexIds', () => {
  it('should include the direct neighbor reached through a straight (tangent-less) segment', () => {
    // mock — A --straight-- B --curved-- C; a plain click-drawn segment has no tangent, but B must still
    // count as a revealed neighbor of A so B's own other segment (to C) can also become visible
    const node = buildNode(
      {
        s1: { endId: 'B', id: 's1', startId: 'A', tangentEnd: null, tangentStart: null },
        s2: { endId: 'C', id: 's2', startId: 'B', tangentEnd: null, tangentStart: { x: 5, y: 0 } },
      },
      { A: { id: 'A', x: 0, y: 0 }, B: { id: 'B', x: 10, y: 0 }, C: { id: 'C', x: 20, y: 0 } },
    );

    // action
    const result = getOneHopVectorVertexIds(node, ['A']);

    // result
    expect(result.sort()).toEqual(['A', 'B']);
  });

  it('should not cascade two hops away from the selected vertex', () => {
    // mock — same chain as above
    const node = buildNode(
      {
        s1: { endId: 'B', id: 's1', startId: 'A', tangentEnd: null, tangentStart: null },
        s2: { endId: 'C', id: 's2', startId: 'B', tangentEnd: null, tangentStart: { x: 5, y: 0 } },
      },
      { A: { id: 'A', x: 0, y: 0 }, B: { id: 'B', x: 10, y: 0 }, C: { id: 'C', x: 20, y: 0 } },
    );

    // action
    const result = getOneHopVectorVertexIds(node, ['A']);

    // result — C is two hops away (A -> B -> C), so it must never be added just from selecting A
    expect(result).not.toContain('C');
  });

  it('should collect every direct neighbor of a branch vertex touched by multiple segments', () => {
    // mock — a starburst: center touches v1/v2/v3 each via its own segment
    const node = buildNode(
      {
        s1: { endId: 'v1', id: 's1', startId: 'center', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v2', id: 's2', startId: 'center', tangentEnd: null, tangentStart: null },
        s3: { endId: 'center', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      {
        center: { id: 'center', x: 0, y: 0 },
        v1: { id: 'v1', x: 10, y: 0 },
        v2: { id: 'v2', x: -10, y: 0 },
        v3: { id: 'v3', x: 0, y: 10 },
      },
    );

    // action
    const result = getOneHopVectorVertexIds(node, ['center']);

    // result
    expect(result.sort()).toEqual(['center', 'v1', 'v2', 'v3']);
  });

  it('should return the selection unchanged when the node has no segments', () => {
    // mock
    const node = buildNode({}, { A: { id: 'A', x: 0, y: 0 } });

    // action
    const result = getOneHopVectorVertexIds(node, ['A']);

    // result
    expect(result).toEqual(['A']);
  });

  it('should not expand through a real curve — a segment with a tangent acts as an opaque boundary, not a pass-through corner', () => {
    // mock — A --curve(real tangentStart at B)-- B --curve(real tangentStart at B)-- C; B is selected, both
    // its own segments are real curves, so neither A's nor C's own other connections may be reached
    const node = buildNode(
      {
        s1: { endId: 'B', id: 's1', startId: 'A', tangentEnd: { x: 3, y: 0 }, tangentStart: null },
        s2: { endId: 'C', id: 's2', startId: 'B', tangentEnd: null, tangentStart: { x: 3, y: 0 } },
      },
      { A: { id: 'A', x: 0, y: 0 }, B: { id: 'B', x: 10, y: 0 }, C: { id: 'C', x: 20, y: 0 } },
    );

    // action
    const result = getOneHopVectorVertexIds(node, ['B']);

    // result — only B itself; A and C are reached solely via real curves, so they're never added here (their
    // own handles on s1/s2 still show separately, through the direct endpoint-selected check, not this one)
    expect(result).toEqual(['B']);
  });

  it('should give the same correct result on a second call with the same node reference, reusing its cached adjacency index', () => {
    // mock — the same node object queried twice with different selections proves the cached
    // straight-segment adjacency index (built once per node reference) stays correct across reuse
    const node = buildNode(
      { s1: { endId: 'B', id: 's1', startId: 'A', tangentEnd: null, tangentStart: null } },
      { A: { id: 'A', x: 0, y: 0 }, B: { id: 'B', x: 10, y: 0 } },
    );

    // action
    const first = getOneHopVectorVertexIds(node, ['A']);
    const second = getOneHopVectorVertexIds(node, ['B']);

    // result
    expect(first.sort()).toEqual(['A', 'B']);
    expect(second.sort()).toEqual(['A', 'B']);
  });
});
