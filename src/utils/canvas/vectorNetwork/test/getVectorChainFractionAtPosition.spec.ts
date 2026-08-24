// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorChainFractionAtPosition } from '../getVectorChainFractionAtPosition';
import { TVectorChainOrder } from '../getVectorChainOrder';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
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

describe('getVectorChainFractionAtPosition', () => {
  it('should return the fraction of the total chain length for a position on a single straight segment', () => {
    // mock — a(0,0)->b(100,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: false };

    // result
    expect(getVectorChainFractionAtPosition(node, chainOrder, 's1', 0.3)).toBeCloseTo(0.3, 5);
  });

  it('should account for a segment that only covers part of the total chain length', () => {
    // mock — a(0,0)->b(100,0)->c(100,200): first segment is 100px, second is 200px, total 300px
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 100, y: 200 } },
    });
    const chainOrder: TVectorChainOrder = {
      entries: [
        { reversed: false, segmentId: 's1' },
        { reversed: false, segmentId: 's2' },
      ],
      isClosed: false,
    };

    // before — halfway along the second segment is 100 + 100 = 200px of the 300px total
    const fraction = getVectorChainFractionAtPosition(node, chainOrder, 's2', 0.5);

    // result
    expect(fraction).toBeCloseTo(200 / 300, 5);
  });

  it('should return 0 for a degenerate chain whose total arc length is zero', () => {
    // mock — a self-closing zero-length segment
    const node = buildNode({ segments: { s1: seg('s1', 'a', 'a') }, vertices: { a: { id: 'a', x: 5, y: 5 } } });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: true };

    // result
    expect(getVectorChainFractionAtPosition(node, chainOrder, 's1', 0)).toBe(0);
  });
});
