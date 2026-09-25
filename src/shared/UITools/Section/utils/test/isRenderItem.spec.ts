// utils
import { isRenderItem } from '../isRenderItem';

describe('isRenderItem', () => {
  it('should be true for a render function and false for plain children', () => {
    // result
    expect(isRenderItem(() => null)).toBe(true);
    expect(isRenderItem('text')).toBe(false);
    expect(isRenderItem(null)).toBe(false);
  });
});
