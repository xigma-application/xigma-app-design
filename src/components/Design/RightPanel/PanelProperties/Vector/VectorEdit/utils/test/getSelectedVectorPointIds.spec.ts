// utils
import { getSelectedVectorPointIds } from '../getSelectedVectorPointIds';
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

describe('getSelectedVectorPointIds', () => {
  it('should return the selected points and the ends of the selected segments once each', () => {
    // result
    expect(getSelectedVectorPointIds(twoSquares, { handles: [], segmentIds: ['s0'], vertexIds: ['a2', 'b1'] })).toEqual(['a2', 'b1', 'a1']);
  });

  it('should skip points and segments the vector no longer has', () => {
    // result
    expect(getSelectedVectorPointIds(twoSquares, { handles: [], segmentIds: ['gone'], vertexIds: ['missing', 'b3'] })).toEqual(['b3']);
  });
});
