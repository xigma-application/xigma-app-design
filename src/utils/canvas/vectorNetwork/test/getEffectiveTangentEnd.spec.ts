// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getEffectiveTangentEnd } from '../getEffectiveTangentEnd';

const buildSegment = (segment: Partial<TVectorSegment> & Pick<TVectorSegment, 'id' | 'startId' | 'endId'>): TVectorSegment => ({
  tangentEnd: null,
  tangentStart: null,
  ...segment,
});

describe('getEffectiveTangentEnd', () => {
  it('should return the real tangentEnd when one is already set', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } };
    const segment = buildSegment({ endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: 7, y: 9 } });

    // action
    const tangentEnd = getEffectiveTangentEnd(vertices, segment);

    // result
    expect(tangentEnd).toEqual({ x: 7, y: 9 });
  });

  it('should derive a default from tangentStart, aimed at the shared control point but only half its length', () => {
    // mock — v1(0,0) -> v2(10,0), tangentStart (2,0); direction toward the shared point is (0,0)-(10,0)+(2,0)=(-8,0),
    // scaled to half of tangentStart's own length (2 * 0.5 = 1)
    const vertices: Record<string, TVectorVertex> = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } };
    const segment = buildSegment({ endId: 'v2', id: 's1', startId: 'v1', tangentStart: { x: 2, y: 0 } });

    // action
    const tangentEnd = getEffectiveTangentEnd(vertices, segment);

    // result — same direction as (v1-v2)+tangentStart, but half of tangentStart's own length
    expect(tangentEnd?.x).toBeCloseTo(-1);
    expect(tangentEnd?.y).toBeCloseTo(0);
  });

  it('should never land on the exact same point as the real tangentStart handle', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 40 } };
    const segment = buildSegment({ endId: 'v2', id: 's1', startId: 'v1', tangentStart: { x: 20, y: -10 } });

    // action
    const tangentEnd = getEffectiveTangentEnd(vertices, segment);

    // result — the two handle positions (vertex + own tangent) must differ
    const handleEndPosition = { x: vertices.v2.x + (tangentEnd?.x ?? 0), y: vertices.v2.y + (tangentEnd?.y ?? 0) };
    const handleStartPosition = { x: vertices.v1.x + segment.tangentStart!.x, y: vertices.v1.y + segment.tangentStart!.y };

    expect(handleEndPosition).not.toEqual(handleStartPosition);
  });

  it('should return null when the shared-point direction degenerates to zero', () => {
    // mock — v1 - v2 exactly cancels tangentStart, leaving no direction to aim the default handle in
    const vertices: Record<string, TVectorVertex> = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } };
    const segment = buildSegment({ endId: 'v2', id: 's1', startId: 'v1', tangentStart: { x: 10, y: 0 } });

    // action
    const tangentEnd = getEffectiveTangentEnd(vertices, segment);

    // result
    expect(tangentEnd).toBeNull();
  });

  it('should return null when neither tangent is set', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } };
    const segment = buildSegment({ endId: 'v2', id: 's1', startId: 'v1' });

    // action
    const tangentEnd = getEffectiveTangentEnd(vertices, segment);

    // result
    expect(tangentEnd).toBeNull();
  });
});
