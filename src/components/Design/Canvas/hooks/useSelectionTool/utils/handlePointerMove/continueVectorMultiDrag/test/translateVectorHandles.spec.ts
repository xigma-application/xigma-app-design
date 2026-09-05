// types
import { TVectorSegment } from 'types/design/types';

// utils
import { translateVectorHandles } from '../translateVectorHandles';

const seg = (id: string): TVectorSegment => ({ endId: 'v2', id, startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } });

describe('translateVectorHandles', () => {
  it('should translate a start handle’s tangent by the delta, rounding to whole pixels', () => {
    const segments = { s1: seg('s1') };

    const result = translateVectorHandles(segments, { 'start:s1': { x: 5, y: 0 } }, 10.4, 3.6);

    expect(result.s1.tangentStart).toEqual({ x: 15, y: 4 });
    expect(result.s1.tangentEnd).toEqual({ x: -5, y: 0 });
  });

  it('should translate an end handle’s tangent by the delta', () => {
    const segments = { s1: seg('s1') };

    const result = translateVectorHandles(segments, { 'end:s1': { x: -5, y: 0 } }, 10, 4);

    expect(result.s1.tangentEnd).toEqual({ x: 5, y: 4 });
    expect(result.s1.tangentStart).toEqual({ x: 5, y: 0 });
  });

  it('should translate both handles of the same segment independently', () => {
    const segments = { s1: seg('s1') };

    const result = translateVectorHandles(segments, { 'end:s1': { x: -5, y: 0 }, 'start:s1': { x: 5, y: 0 } }, 10, 0);

    expect(result.s1).toMatchObject({ tangentEnd: { x: 5, y: 0 }, tangentStart: { x: 15, y: 0 } });
  });

  it('should leave every other segment untouched', () => {
    const segments = { s1: seg('s1'), s2: seg('s2') };

    const result = translateVectorHandles(segments, { 'start:s1': { x: 5, y: 0 } }, 10, 0);

    expect(result.s2).toBe(segments.s2);
  });

  it('should return the original segments object when there are no handle origins to translate', () => {
    const segments = { s1: seg('s1') };

    expect(translateVectorHandles(segments, {}, 10, 0)).toBe(segments);
  });
});
