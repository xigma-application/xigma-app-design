// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorWidthPointHandleAtPoint } from '../getVectorWidthPointHandleAtPoint';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: seg('s1', 'a', 'b') },
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } },
  ...overrides,
});

describe('getVectorWidthPointHandleAtPoint', () => {
  it('should hit an existing width point marker within tolerance', () => {
    // mock — a width point at fraction 0.5 of a straight a(0,0)->b(10,0) segment, i.e. (5, 0)
    const node = buildNode({
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 } } },
    });

    // before — the segment runs along +x, so its perpendicular normal points straight up (angle 90)
    const hit = getVectorWidthPointHandleAtPoint({ x: 6, y: 1 }, [node], 3);

    // result
    expect(hit).toEqual({ angle: 90, nodeId: 'vector-1', point: node.widthProfile?.points.p1, segmentId: 's1', t: 0.5, target: 'point' });
  });

  it('should return null when nothing is within tolerance', () => {
    // mock
    const node = buildNode({
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 } } },
    });

    // before
    const hit = getVectorWidthPointHandleAtPoint({ x: 6, y: 100 }, [node], 3);

    // result
    expect(hit).toBeNull();
  });

  it('should return null for a node with no width profile', () => {
    // mock
    const node = buildNode({ widthProfile: null });

    // before
    const hit = getVectorWidthPointHandleAtPoint({ x: 5, y: 0 }, [node], 3);

    // result
    expect(hit).toBeNull();
  });

  it('should pick the closest marker across multiple candidates', () => {
    // mock — two points both within tolerance of the click, the second one closer
    const node = buildNode({
      widthProfile: {
        points: {
          p1: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 },
          p2: { id: 'p2', leftOffset: 6, position: 0.6, rightOffset: 6 },
        },
      },
    });

    // before — click right at position 0.6's location (6,0)
    const hit = getVectorWidthPointHandleAtPoint({ x: 6, y: 0 }, [node], 3);

    // result
    expect(hit?.point.id).toBe('p2');
  });
});
