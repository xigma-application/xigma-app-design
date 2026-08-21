// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorNodeBounds } from '../getVectorNodeBounds';

const buildNode = (vertices: TVectorNode['vertices'], segments: TVectorNode['segments'] = {}): TVectorNode => ({
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
});
