// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorNodeBounds } from '../getVectorNodeBounds';

const buildNode = (vertices: TVectorNode['vertices'], segments: TVectorNode['segments'] = {}): TVectorNode => ({
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
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

describe('getVectorNodeBounds', () => {
  it('should return a zeroed bounding box when the node has no vertices', () => {
    // before
    const node = buildNode({});

    // result
    expect(getVectorNodeBounds(node)).toEqual({ height: 0, width: 0, x: 0, y: 0 });
  });

  it('should derive the min/max bounding box across multiple vertices', () => {
    // mock
    const node = buildNode({
      v1: { id: 'v1', x: 10, y: 30 },
      v2: { id: 'v2', x: -5, y: 5 },
      v3: { id: 'v3', x: 20, y: -10 },
    });

    // result
    expect(getVectorNodeBounds(node)).toEqual({ height: 40, width: 25, x: -5, y: -10 });
  });

  it('should expand the bounding box to include a segment tangent handle that bulges past its vertices', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: -50 } },
      },
    );

    // result
    expect(getVectorNodeBounds(node)).toEqual({ height: 50, width: 10, x: 0, y: -50 });
  });

  it('should ignore a straight segment with no tangent handles', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // result
    expect(getVectorNodeBounds(node)).toEqual({ height: 10, width: 10, x: 0, y: 0 });
  });

  it('should return the same cached result for the same node reference instead of recomputing', () => {
    // mock
    const node = buildNode({ v1: { id: 'v1', x: 10, y: 30 }, v2: { id: 'v2', x: -5, y: 5 } });

    // before
    const first = getVectorNodeBounds(node);
    const second = getVectorNodeBounds(node);

    // result
    expect(second).toBe(first);
  });

  it('should return the same cached empty bounding box for the same vertex-less node reference instead of recomputing', () => {
    // mock
    const node = buildNode({});

    // before
    const first = getVectorNodeBounds(node);
    const second = getVectorNodeBounds(node);

    // result
    expect(second).toBe(first);
  });

  it('should recompute a fresh result for a different node reference, even with identical content', () => {
    // mock
    const vertices = { v1: { id: 'v1', x: 10, y: 30 }, v2: { id: 'v2', x: -5, y: 5 } };
    const nodeA = buildNode(vertices);
    const nodeB = buildNode(vertices);

    // before
    const resultA = getVectorNodeBounds(nodeA);
    const resultB = getVectorNodeBounds(nodeB);

    // result
    expect(resultB).not.toBe(resultA);
    expect(resultB).toEqual(resultA);
  });
});
