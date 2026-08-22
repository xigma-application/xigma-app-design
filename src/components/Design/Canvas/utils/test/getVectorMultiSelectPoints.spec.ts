// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorMultiSelectPoints } from '../getVectorMultiSelectPoints';

const buildNode = (id: string, segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id,
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

describe('getVectorMultiSelectPoints', () => {
  it('should return no points when nothing is selected', () => {
    // mock
    const node = buildNode('vector-1', {}, { v1: { id: 'v1', x: 0, y: 0 } });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const points = getVectorMultiSelectPoints(nodes, ['vector-1'], [], []);

    // result
    expect(points).toEqual([]);
  });

  it('should resolve the positions of the selected vertices alone', () => {
    // mock
    const node = buildNode(
      'vector-1',
      {},
      {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 100, y: 40 },
        v3: { id: 'v3', x: 50, y: -20 },
      },
    );
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const points = getVectorMultiSelectPoints(nodes, ['vector-1'], ['v1', 'v2'], []);

    // result — v3 is not selected, so it must not appear
    expect(points).toEqual([
      { id: 'v1', x: 0, y: 0 },
      { id: 'v2', x: 100, y: 40 },
    ]);
  });

  it('should include a selected handle end position, resolved via the real tangentEnd', () => {
    // mock — v1(0,0) -> v2(100,0), tangentEnd (0,-30) puts the "end" handle at (100,-30)
    const node = buildNode(
      'vector-1',
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: 0, y: -30 }, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const points = getVectorMultiSelectPoints(nodes, ['vector-1'], [], [{ end: 'end', segmentId: 's1' }]);

    // result
    expect(points).toEqual([{ x: 100, y: -30 }]);
  });

  it('should include a selected handle start position, resolved via the effective (possibly derived) tangentStart', () => {
    // mock — no real tangentStart, derived from tangentEnd instead
    const node = buildNode(
      'vector-1',
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -20, y: 0 }, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const points = getVectorMultiSelectPoints(nodes, ['vector-1'], [], [{ end: 'start', segmentId: 's1' }]);

    // result — direction (v2 - v1 + tangentEnd) = (80, 0), scaled to half of tangentEnd's own length (10), lands at (10, 0)
    expect(points).toEqual([{ x: 10, y: 0 }]);
  });

  it('should include a selected handle end position, resolved via the effective (possibly derived) tangentEnd, when there is no real tangentEnd', () => {
    // mock — no real tangentEnd, derived from tangentStart instead
    const node = buildNode(
      'vector-1',
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 20, y: 0 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const points = getVectorMultiSelectPoints(nodes, ['vector-1'], [], [{ end: 'end', segmentId: 's1' }]);

    // result — direction (v1 - v2 + tangentStart) = (-80, 0), scaled to half of tangentStart's own length (10), lands at (90, 0)
    expect(points).toEqual([{ x: 90, y: 0 }]);
  });

  it('should skip a selected handle whose segment no longer exists', () => {
    // mock
    const node = buildNode('vector-1', {}, { v1: { id: 'v1', x: 0, y: 0 } });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const points = getVectorMultiSelectPoints(nodes, ['vector-1'], ['v1'], [{ end: 'start', segmentId: 'missing-segment' }]);

    // result
    expect(points).toEqual([{ id: 'v1', x: 0, y: 0 }]);
  });

  it('should skip a selected vertex id that no longer exists on any open node', () => {
    // mock
    const node = buildNode('vector-1', {}, { v1: { id: 'v1', x: 0, y: 0 } });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const points = getVectorMultiSelectPoints(nodes, ['vector-1'], ['v1', 'missing-vertex'], []);

    // result
    expect(points).toEqual([{ id: 'v1', x: 0, y: 0 }]);
  });

  it('should resolve vertices and handles owned by different open nodes into one combined list', () => {
    // mock — a genuinely cross-node selection: v1 lives on node A, the handle lives on node B
    const nodeA = buildNode('vector-a', {}, { v1: { id: 'v1', x: 0, y: 0 } });
    const nodeB = buildNode(
      'vector-b',
      { s1: { endId: 'v3', id: 's1', startId: 'v2', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      { v2: { id: 'v2', x: 200, y: 200 }, v3: { id: 'v3', x: 260, y: 200 } },
    );
    const nodes: Record<string, TSceneNode> = { 'vector-a': nodeA, 'vector-b': nodeB };

    // before
    const points = getVectorMultiSelectPoints(nodes, ['vector-a', 'vector-b'], ['v1'], [{ end: 'start', segmentId: 's1' }]);

    // result
    expect(points).toEqual([
      { id: 'v1', x: 0, y: 0 },
      { x: 205, y: 200 },
    ]);
  });
});
