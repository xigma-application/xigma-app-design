// utils
import { getGroupInsertionOrder } from '../getGroupInsertionOrder';

describe('getGroupInsertionOrder', () => {
  it('should insert the group at the topmost member’s slot, removing the member ids', () => {
    // mock
    const containerOrder = ['a', 'b', 'c', 'd'];
    const memberIds = new Set(['a', 'c']);

    // action & result
    expect(getGroupInsertionOrder(containerOrder, memberIds, 'group-1')).toEqual(['b', 'group-1', 'd']);
  });

  it('should keep the group at the front when the topmost member is already first', () => {
    // mock
    const containerOrder = ['a', 'b', 'c'];
    const memberIds = new Set(['a', 'b']);

    // action & result
    expect(getGroupInsertionOrder(containerOrder, memberIds, 'group-1')).toEqual(['group-1', 'c']);
  });

  it('should place the group at the end when every remaining item precedes the topmost member', () => {
    // mock
    const containerOrder = ['a', 'b', 'c'];
    const memberIds = new Set(['c']);

    // action & result
    expect(getGroupInsertionOrder(containerOrder, memberIds, 'group-1')).toEqual(['a', 'b', 'group-1']);
  });

  it('should collapse a non-contiguous member selection into a single insertion slot at the topmost member', () => {
    // mock
    const containerOrder = ['a', 'b', 'c', 'd', 'e'];
    const memberIds = new Set(['b', 'd']);

    // action & result
    expect(getGroupInsertionOrder(containerOrder, memberIds, 'group-1')).toEqual(['a', 'c', 'group-1', 'e']);
  });
});
