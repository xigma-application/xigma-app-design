// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorSegmentNormalAtT } from '../getVectorSegmentNormalAtT';

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

describe('getVectorSegmentNormalAtT', () => {
  it('should return a unit vector perpendicular to a horizontal segment', () => {
    // mock
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };
    const node = buildNode({ vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } } });

    // before
    const normal = getVectorSegmentNormalAtT(node, segment, 0.5);

    // result — perpendicular to the +x tangent, unit length
    expect(Math.hypot(normal.x, normal.y)).toBeCloseTo(1, 5);
    expect(normal.x).toBeCloseTo(0, 5);
    expect(Math.abs(normal.y)).toBeCloseTo(1, 5);
  });

  it('should fall back to a unit vector without dividing by zero for a degenerate zero-length segment', () => {
    // mock — start and end at the same point, so the tangent direction is undefined
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };
    const node = buildNode({ vertices: { a: { id: 'a', x: 5, y: 5 }, b: { id: 'b', x: 5, y: 5 } } });

    // before
    const normal = getVectorSegmentNormalAtT(node, segment, 0.5);

    // result
    expect(Number.isFinite(normal.x)).toBe(true);
    expect(Number.isFinite(normal.y)).toBe(true);
  });
});
