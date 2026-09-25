// utils
import { pickOrigins } from '../pickOrigins';

describe('pickOrigins', () => {
  it('should keep only the origins of the given ids', () => {
    // result
    expect(pickOrigins({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } }, ['b'])).toEqual({ b: { x: 2, y: 2 } });
  });
});
