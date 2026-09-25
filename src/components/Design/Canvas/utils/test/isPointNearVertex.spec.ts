// utils
import { isPointNearVertex } from '../isPointNearVertex';

describe('isPointNearVertex', () => {
  it('should be true within the tolerance and false beyond it', () => {
    // result
    expect(isPointNearVertex({ x: 3, y: 4 }, { id: 'v', x: 0, y: 0 }, 5)).toBe(true);
    expect(isPointNearVertex({ x: 3, y: 4.1 }, { id: 'v', x: 0, y: 0 }, 5)).toBe(false);
  });
});
