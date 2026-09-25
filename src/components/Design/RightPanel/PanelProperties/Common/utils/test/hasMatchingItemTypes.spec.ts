// utils
import { hasMatchingItemTypes } from '../hasMatchingItemTypes';

describe('hasMatchingItemTypes', () => {
  it('should match lists with the same types in the same order', () => {
    // before
    const result = hasMatchingItemTypes([
      [{ type: 'a' }, { type: 'b' }],
      [{ type: 'a' }, { type: 'b' }],
    ]);

    // result
    expect(result).toBe(true);
  });

  it('should not match lists with a different length or order', () => {
    // result
    expect(hasMatchingItemTypes([[{ type: 'a' }], [{ type: 'a' }, { type: 'b' }]])).toBe(false);
    expect(
      hasMatchingItemTypes([
        [{ type: 'a' }, { type: 'b' }],
        [{ type: 'b' }, { type: 'a' }],
      ]),
    ).toBe(false);
  });

  it('should match an empty list of lists', () => {
    // result
    expect(hasMatchingItemTypes([])).toBe(true);
  });
});
