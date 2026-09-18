// utils
import { getStrokesCacheKey } from '../getStrokesCacheKey';

describe('getStrokesCacheKey', () => {
  it('should derive a key distinct from the node id', () => {
    // result
    expect(getStrokesCacheKey('node-1')).toBe('node-1:strokes');
    expect(getStrokesCacheKey('node-1')).not.toBe('node-1');
  });
});
