// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorMultiSelectBounds } from '../getVectorMultiSelectBounds';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: null,
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

describe('getVectorMultiSelectBounds', () => {
  it('should return null when nothing is selected', () => {
    // mock
    const node = buildNode({}, { v1: { id: 'v1', x: 0, y: 0 } });

    // before
    const bounds = getVectorMultiSelectBounds(node, [], []);

    // result
    expect(bounds).toBeNull();
  });

  it('should return the bounding box over the selected vertices alone', () => {
    // mock
    const node = buildNode({}, { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 40 }, v3: { id: 'v3', x: 50, y: -20 } });

    // before
    const bounds = getVectorMultiSelectBounds(node, ['v1', 'v2'], []);

    // result — v3 is not selected, so it must not widen the bounds
    expect(bounds).toEqual({ height: 40, width: 100, x: 0, y: 0 });
  });

  it('should include a selected handle end position, resolved via the real tangentEnd', () => {
    // mock — v1(0,0) -> v2(100,0), tangentEnd (0,-30) puts the "end" handle at (100,-30)
    const node = buildNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: 0, y: -30 }, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    // before
    const bounds = getVectorMultiSelectBounds(node, ['v1'], [{ end: 'end', segmentId: 's1' }]);

    // result
    expect(bounds).toEqual({ height: 30, width: 100, x: 0, y: -30 });
  });

  it('should include a selected handle start position, resolved via the effective (possibly derived) tangentStart', () => {
    // mock — no real tangentStart, derived from tangentEnd instead
    const node = buildNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -20, y: 0 }, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    // before
    const bounds = getVectorMultiSelectBounds(node, [], [{ end: 'start', segmentId: 's1' }]);

    // result — direction (v2 - v1 + tangentEnd) = (80, 0), scaled to half of tangentEnd's own length (10), lands at (10, 0)
    expect(bounds).toEqual({ height: 0, width: 0, x: 10, y: 0 });
  });

  it('should include a selected handle end position, resolved via the effective (possibly derived) tangentEnd, when there is no real tangentEnd', () => {
    // mock — no real tangentEnd, derived from tangentStart instead
    const node = buildNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 20, y: 0 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    // before
    const bounds = getVectorMultiSelectBounds(node, [], [{ end: 'end', segmentId: 's1' }]);

    // result — direction (v1 - v2 + tangentStart) = (-80, 0), scaled to half of tangentStart's own length (10), lands at (90, 0)
    expect(bounds).toEqual({ height: 0, width: 0, x: 90, y: 0 });
  });

  it('should skip a selected handle whose segment no longer exists', () => {
    // mock
    const node = buildNode({}, { v1: { id: 'v1', x: 0, y: 0 } });

    // before
    const bounds = getVectorMultiSelectBounds(node, ['v1'], [{ end: 'start', segmentId: 'missing-segment' }]);

    // result
    expect(bounds).toEqual({ height: 0, width: 0, x: 0, y: 0 });
  });

  it('should skip a selected vertex id that no longer exists on the node', () => {
    // mock
    const node = buildNode({}, { v1: { id: 'v1', x: 0, y: 0 } });

    // before
    const bounds = getVectorMultiSelectBounds(node, ['v1', 'missing-vertex'], []);

    // result
    expect(bounds).toEqual({ height: 0, width: 0, x: 0, y: 0 });
  });
});
