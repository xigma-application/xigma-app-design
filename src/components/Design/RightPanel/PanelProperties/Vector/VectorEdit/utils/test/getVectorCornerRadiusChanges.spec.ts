// utils
import { getVectorCornerRadiusChanges } from '../getVectorCornerRadiusChanges';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

const twoSquares = makeNetworkVector(
  {
    a1: { x: 0, y: 0 },
    a2: { x: 10, y: 0 },
    a3: { x: 10, y: 10 },
    a4: { x: 0, y: 10 },
    b1: { x: 30, y: 20 },
    b2: { x: 50, y: 20 },
    b3: { x: 50, y: 40 },
    b4: { x: 30, y: 40 },
  },
  [
    ['a1', 'a2'],
    ['a2', 'a3'],
    ['a3', 'a4'],
    ['a4', 'a1'],
    ['b1', 'b2'],
    ['b2', 'b3'],
    ['b3', 'b4'],
    ['b4', 'b1'],
  ],
);

describe('getVectorCornerRadiusChanges', () => {
  it('should give only the given points their own radius, starting from their current radius', () => {
    // mock
    const vector = { ...twoSquares, cornerRadius: 4, cornerRadiusByVertexId: { a1: 2, b1: 7 } };

    // result
    expect(getVectorCornerRadiusChanges(vector, ['a1', 'a2'], (radius) => radius + 1)).toEqual({
      cornerRadiusByVertexId: { a1: 3, a2: 5, b1: 7 },
    });
  });

  it('should set the radius of the whole vector and drop the point radii without points', () => {
    // mock
    const vector = { ...twoSquares, cornerRadiusByVertexId: { a1: 2 } };

    // result
    expect(getVectorCornerRadiusChanges(vector, [], () => -5)).toEqual({ cornerRadius: 0, cornerRadiusByVertexId: undefined });
  });
});
