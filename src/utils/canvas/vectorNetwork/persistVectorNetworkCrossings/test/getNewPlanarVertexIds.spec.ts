// utils
import { getNewPlanarVertexIds } from '../getNewPlanarVertexIds';

describe('getNewPlanarVertexIds', () => {
  it('should list the vertices created by planarizing', () => {
    // result
    expect(getNewPlanarVertexIds({ a: { id: 'a', x: 0, y: 0 }, x: { id: 'x', x: 1, y: 1 } }, { a: { id: 'a', x: 0, y: 0 } })).toEqual([
      'x',
    ]);
  });
});
