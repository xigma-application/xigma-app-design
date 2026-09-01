// others
import { NODE_SHAPE_ICON_VIEW_BOX_SIZE } from '../../constants';

// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { fitVectorNetworkToViewBox } from '../fitVectorNetworkToViewBox';

describe('fitVectorNetworkToViewBox', () => {
  it('should center a square network in the view box and scale it to fit within the padding', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 100, y: 100 },
      b: { id: 'b', x: 140, y: 100 },
      c: { id: 'c', x: 140, y: 140 },
      d: { id: 'd', x: 100, y: 140 },
    };

    // action
    const result = fitVectorNetworkToViewBox(vertices, {});

    // result
    const center = NODE_SHAPE_ICON_VIEW_BOX_SIZE / 2;
    expect(result.vertices.a.x).toBeCloseTo(center - 6);
    expect(result.vertices.a.y).toBeCloseTo(center - 6);
    expect(result.vertices.c.x).toBeCloseTo(center + 6);
    expect(result.vertices.c.y).toBeCloseTo(center + 6);
  });

  it('should scale tangent offsets by the same factor and keep null tangents null', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: { x: 10, y: 0 } },
    };

    // action
    const result = fitVectorNetworkToViewBox(vertices, segments);

    // result
    expect(result.segments.s1.tangentStart).toEqual({ x: 1.2, y: 0 });
    expect(result.segments.s1.tangentEnd).toBeNull();
  });

  it('should fall back to a minimum extent instead of dividing by zero for a degenerate (zero-size) network', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 50, y: 50 }, b: { id: 'b', x: 50, y: 50 } };

    // action
    const result = fitVectorNetworkToViewBox(vertices, {});

    // result
    expect(Number.isFinite(result.vertices.a.x)).toBe(true);
    expect(Number.isFinite(result.vertices.a.y)).toBe(true);
    expect(result.vertices.a.x).toBeCloseTo(NODE_SHAPE_ICON_VIEW_BOX_SIZE / 2);
  });
});
