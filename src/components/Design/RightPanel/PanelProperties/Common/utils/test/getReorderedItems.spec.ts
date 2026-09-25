// utils
import { getReorderedItems } from '../getReorderedItems';

describe('getReorderedItems', () => {
  it('should map the reordered shown items back to the node items and keep unknown ones', () => {
    // mock
    const nodeItems = ['nodeA', 'nodeB'];
    const shownItems = ['a', 'b'];

    // before
    const result = getReorderedItems(nodeItems, shownItems, ['b', 'a', 'c']);

    // result
    expect(result).toEqual(['nodeB', 'nodeA', 'c']);
  });
});
