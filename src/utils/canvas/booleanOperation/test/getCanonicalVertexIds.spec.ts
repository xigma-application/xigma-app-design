// utils
import { getCanonicalVertexIds } from '../getCanonicalVertexIds';

describe('getCanonicalVertexIds', () => {
  it('should map vertices at the same spot to the first one found there', () => {
    // before
    const ids = getCanonicalVertexIds({
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 0.0001, y: 0 },
      c: { id: 'c', x: 10, y: 0 },
    });

    // result
    expect([...ids]).toEqual([
      ['a', 'a'],
      ['b', 'a'],
      ['c', 'c'],
    ]);
  });
});
