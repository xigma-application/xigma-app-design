// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';
import { roundVectorNetworkCorners } from '../roundVectorNetworkCorners';

describe('roundVectorNetworkCorners', () => {
  it('should replace every corner of a square by two cut points and an arc between them', () => {
    // mock
    const square = makeSquareVector();

    // before
    const network = roundVectorNetworkCorners(square, 10);

    // result
    expect(Object.keys(network?.vertices ?? {})).toHaveLength(8);
    expect(Object.keys(network?.segments ?? {})).toHaveLength(8);
    expect(
      Object.values(network?.vertices ?? {})
        .map(({ x, y }) => `${Math.round(x)},${Math.round(y)}`)
        .sort(),
    ).toEqual(['0,10', '0,90', '10,0', '10,100', '100,10', '100,90', '90,0', '90,100'].sort());
  });

  it('should leave a network without sharp straight corners alone', () => {
    // mock
    const line = {
      segments: { s: { endId: 'b', id: 's', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, lone: { id: 'lone', x: 5, y: 5 } },
    };

    // result
    expect(roundVectorNetworkCorners(line, 10)).toBeNull();
  });
});
