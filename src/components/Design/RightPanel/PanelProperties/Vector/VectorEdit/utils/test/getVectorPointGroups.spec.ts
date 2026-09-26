// utils
import { getVectorPointGroups } from '../getVectorPointGroups';
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

describe('getVectorPointGroups', () => {
  it('should group the selected points by the connected piece they belong to, with the box of each group', () => {
    // result
    expect(getVectorPointGroups(twoSquares, ['a1', 'b1', 'a3', 'b2'])).toEqual([
      { nodeId: 'vector', rect: { height: 10, width: 10, x: 0, y: 0 }, vertexIds: ['a1', 'a3'] },
      { nodeId: 'vector', rect: { height: 0, width: 20, x: 30, y: 20 }, vertexIds: ['b1', 'b2'] },
    ]);
  });

  it('should keep a lone point as its own group', () => {
    // mock
    const vector = { ...twoSquares, vertices: { ...twoSquares.vertices, lone: { id: 'lone', x: 5, y: 5 } } };

    // result
    expect(getVectorPointGroups(vector, ['lone', 'a2'])).toHaveLength(2);
  });

  it('should return no groups without selected points', () => {
    // result
    expect(getVectorPointGroups(twoSquares, [])).toEqual([]);
  });
});
