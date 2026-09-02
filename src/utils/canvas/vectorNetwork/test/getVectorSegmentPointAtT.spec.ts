// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorSegmentPointAtT } from '../getVectorSegmentPointAtT';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('getVectorSegmentPointAtT', () => {
  it('should return the midpoint of a straight segment at t=0.5', () => {
    // mock
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };
    const node = buildNode({ vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } } });

    // before
    const point = getVectorSegmentPointAtT(node, segment, 0.5);

    // result
    expect(point).toEqual({ x: 5, y: 0 });
  });

  it('should return a curved point when the segment has tangents', () => {
    // mock
    const segment: TVectorSegment = {
      endId: 'b',
      id: 's1',
      startId: 'a',
      tangentEnd: { x: 0, y: 10 },
      tangentStart: { x: 0, y: 10 },
    };
    const node = buildNode({ vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } } });

    // before
    const point = getVectorSegmentPointAtT(node, segment, 0.5);

    // result
    expect(point.y).toBeGreaterThan(0);
  });
});
