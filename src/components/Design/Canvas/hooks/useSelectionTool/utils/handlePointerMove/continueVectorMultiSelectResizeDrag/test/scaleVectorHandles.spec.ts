// types
import { TVectorSegment } from 'types/design/types';

// utils
import { scaleVectorHandles } from '../scaleVectorHandles';

const seg = (id: string): TVectorSegment => ({ endId: 'v2', id, startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } });

describe('scaleVectorHandles', () => {
  it('should scale a start handle’s tangent from the origin, rounding to whole pixels', () => {
    const segments = { s1: seg('s1') };

    const result = scaleVectorHandles(segments, { 'start:s1': { x: 5, y: 0 } }, 0, 2, 3);

    expect(result.s1.tangentStart).toEqual({ x: 10, y: 0 });
    expect(result.s1.tangentEnd).toEqual({ x: -5, y: 0 });
  });

  it('should scale an end handle’s tangent from the origin', () => {
    const segments = { s1: seg('s1') };

    const result = scaleVectorHandles(segments, { 'end:s1': { x: -5, y: 0 } }, 0, 2, 1);

    expect(result.s1.tangentEnd).toEqual({ x: -10, y: 0 });
    expect(result.s1.tangentStart).toEqual({ x: 5, y: 0 });
  });

  it('should scale along the box’s own (rotated) local axes, not world axes, when rotated', () => {
    const segments = { s1: seg('s1') };

    const result = scaleVectorHandles(segments, { 'start:s1': { x: 10, y: 0 } }, 90, 2, 1);

    expect(result.s1.tangentStart?.x).toBeCloseTo(10);
    expect(result.s1.tangentStart?.y).toBeCloseTo(0);
  });

  it('should scale both handles of the same segment independently', () => {
    const segments = { s1: seg('s1') };

    const result = scaleVectorHandles(segments, { 'end:s1': { x: -5, y: 0 }, 'start:s1': { x: 5, y: 0 } }, 0, 2, 1);

    expect(result.s1).toMatchObject({ tangentEnd: { x: -10, y: 0 }, tangentStart: { x: 10, y: 0 } });
  });

  it('should leave every other segment untouched', () => {
    const segments = { s1: seg('s1'), s2: seg('s2') };

    const result = scaleVectorHandles(segments, { 'start:s1': { x: 5, y: 0 } }, 0, 2, 1);

    expect(result.s2).toBe(segments.s2);
  });

  it('should return the original segments object when there are no handle origins to scale', () => {
    const segments = { s1: seg('s1') };

    expect(scaleVectorHandles(segments, {}, 0, 2, 1)).toBe(segments);
  });
});
