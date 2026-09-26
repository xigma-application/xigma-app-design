// utils
import { getRoundedVectorSizes } from '../getRoundedVectorSizes';
import { makeNetworkVector, makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getRoundedVectorSizes', () => {
  it('should return the size of each vector bounds rounded to two decimals', () => {
    // mock
    const line = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 10.456, y: 3.333 } }, [['a', 'b']]);

    // result
    expect(getRoundedVectorSizes([makeSquareVector(), line])).toEqual([
      { height: 100, width: 100 },
      { height: 3.33, width: 10.46 },
    ]);
  });
});
