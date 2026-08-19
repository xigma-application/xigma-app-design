// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getEffectiveTangentStart } from '../getEffectiveTangentStart';

const buildSegment = (segment: Partial<TVectorSegment> & Pick<TVectorSegment, 'id' | 'startId' | 'endId'>): TVectorSegment => ({
  tangentEnd: null,
  tangentStart: null,
  ...segment,
});

describe('getEffectiveTangentStart', () => {
  it('should return the real tangentStart when one is already set', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } };
    const segment = buildSegment({ endId: 'v2', id: 's1', startId: 'v1', tangentStart: { x: 7, y: 9 } });

    // action
    const tangentStart = getEffectiveTangentStart(vertices, segment);

    // result
    expect(tangentStart).toEqual({ x: 7, y: 9 });
  });

  it('should derive a default from tangentEnd, aimed at the shared control point but only half its length', () => {
    // mock — v1(0,0) -> v2(10,0), tangentEnd (-2,0); direction toward the shared point is (10,0)+(-2,0)=(8,0),
    // scaled to half of tangentEnd's own length (2 * 0.5 = 1)
    const vertices: Record<string, TVectorVertex> = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } };
    const segment = buildSegment({ endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -2, y: 0 } });

    // action
    const tangentStart = getEffectiveTangentStart(vertices, segment);

    // result — same direction as (v2-v1)+tangentEnd, but half of tangentEnd's own length
    expect(tangentStart?.x).toBeCloseTo(1);
    expect(tangentStart?.y).toBeCloseTo(0);
  });

  it('should never land on the exact same point as the real tangentEnd handle', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 40 } };
    const segment = buildSegment({ endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -20, y: 60 } });

    // action
    const tangentStart = getEffectiveTangentStart(vertices, segment);

    // result — the two handle positions (vertex + own tangent) must differ
    const handleStartPosition = { x: vertices.v1.x + (tangentStart?.x ?? 0), y: vertices.v1.y + (tangentStart?.y ?? 0) };
    const handleEndPosition = { x: vertices.v2.x + segment.tangentEnd!.x, y: vertices.v2.y + segment.tangentEnd!.y };

    expect(handleStartPosition).not.toEqual(handleEndPosition);
  });

  it('should return null when the shared-point direction degenerates to zero', () => {
    // mock — v2 - v1 exactly cancels tangentEnd, leaving no direction to aim the default handle in
    const vertices: Record<string, TVectorVertex> = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } };
    const segment = buildSegment({ endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -10, y: 0 } });

    // action
    const tangentStart = getEffectiveTangentStart(vertices, segment);

    // result
    expect(tangentStart).toBeNull();
  });

  it('should return null when neither tangent is set', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } };
    const segment = buildSegment({ endId: 'v2', id: 's1', startId: 'v1' });

    // action
    const tangentStart = getEffectiveTangentStart(vertices, segment);

    // result
    expect(tangentStart).toBeNull();
  });
});
