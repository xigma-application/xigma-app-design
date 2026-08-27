// types
import { TVectorSegment } from 'types/design/types';

// utils
import { findNewSegmentId } from '../findNewSegmentId';

const segment = (id: string): TVectorSegment => ({ endId: 'b', id, startId: 'a', tangentEnd: null, tangentStart: null });

describe('findNewSegmentId', () => {
  it('should return the id present only in the after map', () => {
    // action
    const result = findNewSegmentId({ s1: segment('s1') }, { s1: segment('s1'), s2: segment('s2') });

    // result
    expect(result).toBe('s2');
  });

  it('should return undefined when no segment was added', () => {
    // action
    const result = findNewSegmentId({ s1: segment('s1') }, { s1: segment('s1') });

    // result
    expect(result).toBeUndefined();
  });
});
