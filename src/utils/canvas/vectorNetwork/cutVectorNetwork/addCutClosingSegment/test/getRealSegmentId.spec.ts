// utils
import { getRealSegmentId } from '../getRealSegmentId';

describe('getRealSegmentId', () => {
  it('should strip the "#N" fragment suffix left by an earlier cut', () => {
    // result
    expect(getRealSegmentId('s2#1')).toBe('s2');
  });

  it('should return the id unchanged when it has no fragment suffix', () => {
    // result
    expect(getRealSegmentId('s2')).toBe('s2');
  });
});
