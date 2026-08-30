// utils
import { getUngroupedOrder } from '../getUngroupedOrder';

describe('getUngroupedOrder', () => {
  it('should replace the group id with its children in place', () => {
    // action & result
    expect(getUngroupedOrder(['a', 'group-1', 'b'], 'group-1', ['x', 'y'])).toEqual(['a', 'x', 'y', 'b']);
  });

  it('should keep the children at the front when the group was first', () => {
    // action & result
    expect(getUngroupedOrder(['group-1', 'b'], 'group-1', ['x', 'y'])).toEqual(['x', 'y', 'b']);
  });
});
