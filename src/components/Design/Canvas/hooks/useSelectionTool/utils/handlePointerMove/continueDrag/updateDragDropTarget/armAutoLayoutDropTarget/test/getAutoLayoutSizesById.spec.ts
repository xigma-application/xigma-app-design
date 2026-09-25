// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { getAutoLayoutSizesById } from '../getAutoLayoutSizesById';

describe('getAutoLayoutSizesById', () => {
  it('should index the child sizes by id', () => {
    // mock
    const sizes = [
      { id: 'a', width: 1 },
      { id: 'b', width: 2 },
    ] as unknown as TAutoLayoutChildSize[];

    // result
    expect(getAutoLayoutSizesById(sizes)).toEqual({ a: sizes[0], b: sizes[1] });
  });
});
