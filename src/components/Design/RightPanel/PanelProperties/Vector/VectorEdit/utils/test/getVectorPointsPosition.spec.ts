// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getVectorPointsPosition } from '../getVectorPointsPosition';
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

describe('getVectorPointsPosition', () => {
  it('should return the top left corner of the points of a vector on the canvas', () => {
    // result
    expect(getVectorPointsPosition(twoSquares, ['b3', 'a2'], {})).toEqual({ origin: { x: 10, y: 0 }, parent: undefined, x: 10, y: 0 });
  });

  it('should return the corner relative to the parent frame', () => {
    // mock
    const frame = { height: 100, id: 'frame', rotation: 0, type: NodeType.frame, width: 100, x: 5, y: 8 } as unknown as TSceneNode;

    // before
    const position = getVectorPointsPosition({ ...twoSquares, parentId: 'frame' }, ['b1'], { frame });

    // result
    expect({ x: position.x, y: position.y }).toEqual({ x: 25, y: 12 });
    expect(position.parent).toBe(frame);
  });
});
