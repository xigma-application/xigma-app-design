// types
import { TVectorSegment } from 'types/design/types';

// utils
import { getMirroredVectorSegments } from '../getMirroredVectorSegments';

const buildSegment = (segment: Partial<TVectorSegment> & Pick<TVectorSegment, 'id' | 'startId' | 'endId'>): TVectorSegment => ({
  tangentEnd: null,
  tangentStart: null,
  ...segment,
});

describe('getMirroredVectorSegments', () => {
  it('should only update the dragged handle and skip mirroring when the new tangent is null', () => {
    // mock
    const segments = {
      s1: buildSegment({ endId: 'v2', id: 's1', startId: 'v1' }),
      s2: buildSegment({ endId: 'v1', id: 's2', startId: 'v3', tangentEnd: { x: 3, y: 0 } }),
    };

    // action
    const updated = getMirroredVectorSegments(segments, 'v1', 'symmetric', 's1', 'tangentStart', null);

    // result
    expect(updated.s1.tangentStart).toBeNull();
    expect(updated.s2.tangentEnd).toEqual({ x: 3, y: 0 });
  });

  it('should only update the dragged handle and skip mirroring when the vertex mode is corner', () => {
    // mock
    const segments = {
      s1: buildSegment({ endId: 'v2', id: 's1', startId: 'v1' }),
      s2: buildSegment({ endId: 'v1', id: 's2', startId: 'v3', tangentEnd: { x: 1, y: 1 } }),
    };

    // action
    const updated = getMirroredVectorSegments(segments, 'v1', 'corner', 's1', 'tangentStart', { x: 5, y: 0 });

    // result
    expect(updated.s1.tangentStart).toEqual({ x: 5, y: 0 });
    expect(updated.s2.tangentEnd).toEqual({ x: 1, y: 1 });
  });

  it('should mirror onto the other segment tangentEnd with the dragged handle own length in symmetric mode', () => {
    // mock
    const segments = {
      s1: buildSegment({ endId: 'v2', id: 's1', startId: 'v1' }),
      s2: buildSegment({ endId: 'v1', id: 's2', startId: 'v3', tangentEnd: { x: 1, y: 1 } }),
    };

    // action
    const updated = getMirroredVectorSegments(segments, 'v1', 'symmetric', 's1', 'tangentStart', { x: -3, y: 4 });

    // result
    expect(updated.s1.tangentStart).toEqual({ x: -3, y: 4 });
    expect(updated.s2.tangentEnd?.x).toBeCloseTo(3);
    expect(updated.s2.tangentEnd?.y).toBeCloseTo(-4);
  });

  it('should mirror onto the other segment tangentStart with the other handle own length in smooth mode', () => {
    // mock
    const segments = {
      s1: buildSegment({ endId: 'v2', id: 's1', startId: 'v1' }),
      s2: buildSegment({ endId: 'v9', id: 's2', startId: 'v1', tangentStart: { x: 3, y: 4 } }),
    };

    // action
    const updated = getMirroredVectorSegments(segments, 'v1', 'smooth', 's1', 'tangentStart', { x: -6, y: -8 });

    // result
    expect(updated.s1.tangentStart).toEqual({ x: -6, y: -8 });
    expect(updated.s2.tangentStart?.x).toBeCloseTo(3);
    expect(updated.s2.tangentStart?.y).toBeCloseTo(4);
  });

  it('should mirror onto the other segment still-null tangent using the dragged handle own length', () => {
    // mock — s2 touches v1 but has no tangentEnd set yet (a fresh corner-handle pull)
    const segments = {
      s1: buildSegment({ endId: 'v2', id: 's1', startId: 'v1' }),
      s2: buildSegment({ endId: 'v1', id: 's2', startId: 'v9' }),
    };

    // action
    const updated = getMirroredVectorSegments(segments, 'v1', 'smooth', 's1', 'tangentStart', { x: -6, y: -8 });

    // result
    expect(updated.s1.tangentStart).toEqual({ x: -6, y: -8 });
    expect(updated.s2.tangentEnd?.x).toBeCloseTo(6);
    expect(updated.s2.tangentEnd?.y).toBeCloseTo(8);
  });

  it('should skip mirroring when no other segment has a handle at the shared vertex', () => {
    // mock
    const segments = {
      s1: buildSegment({ endId: 'v2', id: 's1', startId: 'v1' }),
      s3: buildSegment({ endId: 'v9', id: 's3', startId: 'v1' }),
      s4: buildSegment({ endId: 'v1', id: 's4', startId: 'v9' }),
    };

    // action
    const updated = getMirroredVectorSegments(segments, 'v1', 'symmetric', 's1', 'tangentStart', { x: 5, y: 0 });

    // result
    expect(updated.s1.tangentStart).toEqual({ x: 5, y: 0 });
    expect(updated.s3.tangentStart).toBeNull();
    expect(updated.s4.tangentEnd).toBeNull();
  });

  it('should skip mirroring when more than one other segment has a handle at the shared vertex', () => {
    // mock
    const segments = {
      s1: buildSegment({ endId: 'v2', id: 's1', startId: 'v1' }),
      s2: buildSegment({ endId: 'v1', id: 's2', startId: 'v3', tangentEnd: { x: 1, y: 1 } }),
      s3: buildSegment({ endId: 'v4', id: 's3', startId: 'v1', tangentStart: { x: 2, y: 2 } }),
    };

    // action
    const updated = getMirroredVectorSegments(segments, 'v1', 'symmetric', 's1', 'tangentStart', { x: 5, y: 0 });

    // result
    expect(updated.s1.tangentStart).toEqual({ x: 5, y: 0 });
    expect(updated.s2.tangentEnd).toEqual({ x: 1, y: 1 });
    expect(updated.s3.tangentStart).toEqual({ x: 2, y: 2 });
  });
});
