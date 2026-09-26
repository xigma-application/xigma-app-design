// types
import { TVectorPointGroup } from '../../types';

// utils
import { getTidyUpVectorPointGroupDeltas } from '../getTidyUpVectorPointGroupDeltas';

describe('getTidyUpVectorPointGroupDeltas', () => {
  it('should line up groups sharing a row with an even gap', () => {
    // mock
    const groups: TVectorPointGroup[] = [
      { rect: { height: 10, width: 10, x: 0, y: 0 }, vertexIds: ['a'] },
      { rect: { height: 10, width: 10, x: 20, y: 3 }, vertexIds: ['b'] },
      { rect: { height: 10, width: 10, x: 60, y: 1 }, vertexIds: ['c'] },
    ];

    // before
    const deltas = getTidyUpVectorPointGroupDeltas(groups);

    // result
    expect(deltas).toHaveLength(3);
    expect(deltas.some(({ x, y }) => x !== 0 || y !== 0)).toBe(true);
  });
});
