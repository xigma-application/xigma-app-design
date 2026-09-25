// utils
import { getAxisSpan } from '../getAxisSpan';

describe('getAxisSpan', () => {
  it('should read the start and size along the axis', () => {
    // mock
    const rect = { height: 40, width: 30, x: 5, y: 10 };

    // result
    expect(getAxisSpan(rect, 'horizontal')).toEqual({ size: 30, start: 5 });
    expect(getAxisSpan(rect, 'vertical')).toEqual({ size: 40, start: 10 });
  });
});
