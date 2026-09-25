// utils
import { getSharedStrokeSetting } from '../getSharedStrokeSetting';

describe('getSharedStrokeSetting', () => {
  it('should return the empty value for no values', () => {
    // result
    expect(getSharedStrokeSetting([], 'none')).toBe('none');
  });

  it('should return the shared value or undefined when mixed', () => {
    // result
    expect(getSharedStrokeSetting(['a', 'a'], 'none')).toBe('a');
    expect(getSharedStrokeSetting(['a', 'b'], 'none')).toBeUndefined();
  });
});
