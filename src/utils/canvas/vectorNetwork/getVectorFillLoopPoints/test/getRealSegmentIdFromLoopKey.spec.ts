// utils
import { getRealSegmentIdFromLoopKey } from '../getRealSegmentIdFromLoopKey';

describe('getRealSegmentIdFromLoopKey', () => {
  it('should strip the bracketed boundaries off the first piece key', () => {
    expect(getRealSegmentIdFromLoopKey('s1[v:a|v:b],s2[v:b|v:c]')).toBe('s1');
  });

  it('should return the whole first piece key when it has no bracket at all', () => {
    expect(getRealSegmentIdFromLoopKey('s1')).toBe('s1');
  });
});
