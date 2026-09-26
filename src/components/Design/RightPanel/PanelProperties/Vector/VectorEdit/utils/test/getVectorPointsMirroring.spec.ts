// utils
import { getVectorPointsMirroring } from '../getVectorPointsMirroring';
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

describe('getVectorPointsMirroring', () => {
  it('should return the mirroring the points share, reading a point without one as no mirroring', () => {
    // mock
    const vector = { ...twoSquares, vertexHandleModes: { a1: 'smooth' as const, a2: 'smooth' as const, a3: 'corner' as const } };

    // result
    expect(getVectorPointsMirroring([{ handles: [], node: vector, pointIds: ['a1', 'a2'], vertexIds: ['a1', 'a2'] }])).toBe('smooth');
    expect(getVectorPointsMirroring([{ handles: [], node: vector, pointIds: ['a3', 'a4'], vertexIds: ['a3', 'a4'] }])).toBe('corner');
  });

  it('should return an empty value when the points differ', () => {
    // mock
    const vector = { ...twoSquares, vertexHandleModes: { a1: 'symmetric' as const } };

    // result
    expect(getVectorPointsMirroring([{ handles: [], node: vector, pointIds: ['a1', 'a2'], vertexIds: ['a1', 'a2'] }])).toBe('');
  });
});
