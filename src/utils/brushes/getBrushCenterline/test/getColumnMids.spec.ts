// utils
import { createAlpha } from '../../test/brushFixtures';
import { getColumnMids } from '../getColumnMids';

describe('getColumnMids', () => {
  it('should give the middle of the opaque rows per column and null for empty columns', () => {
    // action
    const mids = getColumnMids(createAlpha(6, 10, (x, y) => x >= 2 && x < 5 && y >= 2 && y <= 6));

    // result
    expect(mids).toEqual([null, null, 4, 4, 4, null]);
  });
});
