// others
import { getShiftedLeftStyle } from './getShiftedLeftStyle';

describe('getShiftedLeftStyle', () => {
  it('should return undefined at depthOffset 0, leaving the base position unshifted', () => {
    // result
    expect(getShiftedLeftStyle(26.5, 0)).toBeUndefined();
  });

  it('should pull the base position back left by one indent-width per nesting level', () => {
    // result
    expect(getShiftedLeftStyle(26.5, 2)).toEqual({ left: 'calc(26.5px - 42px)' });
  });
});
