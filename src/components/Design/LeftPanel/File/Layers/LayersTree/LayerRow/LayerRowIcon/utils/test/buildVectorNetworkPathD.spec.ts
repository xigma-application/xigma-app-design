// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { buildVectorNetworkPathD } from '../buildVectorNetworkPathD';

describe('buildVectorNetworkPathD', () => {
  it('should draw a straight line segment with an M/L command when there are no tangents', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } };
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    };

    // action
    const result = buildVectorNetworkPathD(vertices, segments);

    // result
    expect(result).toBe('M0 0 L10 0');
  });

  it('should draw a curved segment with an M/C command using the tangent offsets', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } };
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: { x: -2, y: 1 }, tangentStart: { x: 2, y: 1 } },
    };

    // action
    const result = buildVectorNetworkPathD(vertices, segments);

    // result
    expect(result).toBe('M0 0 C2 1 8 1 10 0');
  });

  it('should chain consecutive segments into a single subpath when the next start matches the previous end', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 10, y: 0 },
      c: { id: 'c', x: 10, y: 10 },
    };
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    };

    // action
    const result = buildVectorNetworkPathD(vertices, segments);

    // result
    expect(result).toBe('M0 0 L10 0 L10 10');
  });

  it('should start a new subpath with its own M command when segments are disconnected', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 10, y: 0 },
      c: { id: 'c', x: 20, y: 20 },
      d: { id: 'd', x: 30, y: 20 },
    };
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'd', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null },
    };

    // action
    const result = buildVectorNetworkPathD(vertices, segments);

    // result
    expect(result).toBe('M0 0 L10 0 M20 20 L30 20');
  });
});
