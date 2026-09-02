// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorMultiSelectOrigins } from '../getVectorMultiSelectOrigins';

const vector: TVectorNode = {
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
    s3: { endId: 'v3', id: 's3', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 5 }, v3: { id: 'v3', x: 20, y: 10 } },
};

const nodes: Record<string, TSceneNode> = { 'vector-1': vector };
const vectorEditingNodeIds = ['vector-1'];

describe('getVectorMultiSelectOrigins', () => {
  it('should snapshot every selected vertex origin and every selected handle origin, keyed by end:segmentId', () => {
    // before
    const origins = getVectorMultiSelectOrigins(
      nodes,
      vectorEditingNodeIds,
      ['v1', 'v3'],
      [
        { end: 'start', segmentId: 's1' },
        { end: 'end', segmentId: 's1' },
      ],
    );

    // result
    expect(origins).toEqual({
      handleOrigins: { 'end:s1': { x: -5, y: 0 }, 'start:s1': { x: 5, y: 0 } },
      vertexOrigins: { v1: { x: 0, y: 0 }, v3: { x: 20, y: 10 } },
    });
  });

  it('should skip a selected vertex id that does not resolve to any currently-open node', () => {
    // before
    const origins = getVectorMultiSelectOrigins(nodes, vectorEditingNodeIds, ['v1', 'missing-vertex'], []);

    // result
    expect(origins.vertexOrigins).toEqual({ v1: { x: 0, y: 0 } });
  });

  it('should skip a handle whose end has no resolvable tangent', () => {
    // before — s2's end (v3) has no tangentEnd at all
    const origins = getVectorMultiSelectOrigins(nodes, vectorEditingNodeIds, [], [{ end: 'end', segmentId: 's2' }]);

    // result
    expect(origins.handleOrigins).toEqual({});
  });

  it('should resolve a selected end-handle to its derived preview position (not skip it) when only tangentStart is real, so a multi-drag started on it moves it instead of leaving it frozen', () => {
    // before — s3's tangentEnd is null but tangentStart is real, so the end handle only exists as a
    // rendered preview (getEffectiveTangentEnd); it must still get an origin, or a group-drag would
    // move every other selected handle by delta while this one stays put, looking like a resize
    const origins = getVectorMultiSelectOrigins(nodes, vectorEditingNodeIds, [], [{ end: 'end', segmentId: 's3' }]);

    // result
    expect(origins.handleOrigins['end:s3']?.x).toBeCloseTo(-2.0801257358446095);
    expect(origins.handleOrigins['end:s3']?.y).toBeCloseTo(-1.386750490563073);
  });

  it('should return empty origins when nothing is selected', () => {
    // before
    const origins = getVectorMultiSelectOrigins(nodes, vectorEditingNodeIds, [], []);

    // result
    expect(origins).toEqual({ handleOrigins: {}, vertexOrigins: {} });
  });

  it('should resolve vertices and handles owned by different open nodes into one combined origin map', () => {
    // mock — a genuinely cross-node selection: v1 lives on node A, the handle lives on node B
    const nodeA: TVectorNode = { ...vector, id: 'vector-a', segments: {}, vertices: { v1: { id: 'v1', x: 0, y: 0 } } };
    const nodeB: TVectorNode = {
      ...vector,
      id: 'vector-b',
      segments: { s1: { endId: 'v3', id: 's1', startId: 'v2', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      vertices: { v2: { id: 'v2', x: 200, y: 200 }, v3: { id: 'v3', x: 260, y: 200 } },
    };
    const crossNodes: Record<string, TSceneNode> = { 'vector-a': nodeA, 'vector-b': nodeB };

    // before
    const origins = getVectorMultiSelectOrigins(crossNodes, ['vector-a', 'vector-b'], ['v1'], [{ end: 'start', segmentId: 's1' }]);

    // result — 'start:s1' is the segment's own real tangentStart, unaffected by v2's absolute position
    expect(origins).toEqual({ handleOrigins: { 'start:s1': { x: 5, y: 0 } }, vertexOrigins: { v1: { x: 0, y: 0 } } });
  });
});
