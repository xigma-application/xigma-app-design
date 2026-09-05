// utils
import { pickOrigins } from '../pickOrigins';

describe('pickOrigins', () => {
  it('should pick only the requested ids from the origins map, preserving their positions', () => {
    const origins = { a: { x: 1, y: 1 }, b: { x: 2, y: 2 }, c: { x: 3, y: 3 } };

    expect(pickOrigins(origins, ['a', 'c'])).toEqual({ a: { x: 1, y: 1 }, c: { x: 3, y: 3 } });
  });

  it('should return an empty object when no ids are requested', () => {
    expect(pickOrigins({ a: { x: 1, y: 1 } }, [])).toEqual({});
  });
});
