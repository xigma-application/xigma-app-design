// utils
import { getNextBooleanShapeKey } from '../getNextBooleanShapeKey';

describe('getNextBooleanShapeKey', () => {
  it('should hand out a new, larger key on every call', () => {
    // before
    const first = getNextBooleanShapeKey();
    const second = getNextBooleanShapeKey();

    // result
    expect(second).toBe(first + 1);
  });
});
