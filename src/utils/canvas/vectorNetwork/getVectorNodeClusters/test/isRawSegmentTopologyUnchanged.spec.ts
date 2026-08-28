// types
import { TVectorSegment, TVectorTangent } from 'types/design/types';

// utils
import { isRawSegmentTopologyUnchanged } from '../isRawSegmentTopologyUnchanged';

const seg = (
  id: string,
  startId: string,
  endId: string,
  tangentStart: TVectorTangent = null,
  tangentEnd: TVectorTangent = null,
): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd,
  tangentStart,
});

const toRecord = (segments: TVectorSegment[]): Record<string, TVectorSegment> =>
  Object.fromEntries(segments.map((segment) => [segment.id, segment]));

describe('isRawSegmentTopologyUnchanged', () => {
  it('should return true for the exact same segments object', () => {
    const segments = toRecord([seg('ab', 'a', 'b')]);

    expect(isRawSegmentTopologyUnchanged(segments, segments)).toBe(true);
  });

  it('should return true when every segment kept the same startId/endId, even if a segment’s own reference (and unrelated fields) changed', () => {
    const prev = toRecord([seg('ab', 'a', 'b')]);
    const next = toRecord([seg('ab', 'a', 'b', { x: 1, y: 1 })]);

    expect(isRawSegmentTopologyUnchanged(prev, next)).toBe(true);
  });

  it('should return true for two empty segment records', () => {
    expect(isRawSegmentTopologyUnchanged({}, {})).toBe(true);
  });

  it('should return false when a segment was added', () => {
    const prev = toRecord([seg('ab', 'a', 'b')]);
    const next = toRecord([seg('ab', 'a', 'b'), seg('bc', 'b', 'c')]);

    expect(isRawSegmentTopologyUnchanged(prev, next)).toBe(false);
  });

  it('should return false when a segment was removed', () => {
    const prev = toRecord([seg('ab', 'a', 'b'), seg('bc', 'b', 'c')]);
    const next = toRecord([seg('ab', 'a', 'b')]);

    expect(isRawSegmentTopologyUnchanged(prev, next)).toBe(false);
  });

  it('should return false when the segment id set is swapped for a different one of the same size', () => {
    const prev = toRecord([seg('ab', 'a', 'b')]);
    const next = toRecord([seg('cd', 'c', 'd')]);

    expect(isRawSegmentTopologyUnchanged(prev, next)).toBe(false);
  });

  it('should return false when a segment’s startId was rewired to a different vertex', () => {
    const prev = toRecord([seg('ab', 'a', 'b')]);
    const next = toRecord([seg('ab', 'z', 'b')]);

    expect(isRawSegmentTopologyUnchanged(prev, next)).toBe(false);
  });

  it('should return false when a segment’s endId was rewired to a different vertex', () => {
    const prev = toRecord([seg('ab', 'a', 'b')]);
    const next = toRecord([seg('ab', 'a', 'z')]);

    expect(isRawSegmentTopologyUnchanged(prev, next)).toBe(false);
  });
});
