// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getNodeLocalCorners } from '../getNodeLocalCorners';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getNodeLocalCorners', () => {
  it('should return the tight corners of a vector in the frame of a turned group', () => {
    // mock — a diagonal line from (0,0) to (100,100) lies flat along the x axis of a group turned 45°
    const line = makeNetworkVector(
      {
        a: { x: 0, y: 0 },
        b: { x: 100, y: 100 },
      },
      [['a', 'b']],
    );

    // before
    const corners = getNodeLocalCorners(line, 45);

    // result — no height across the line, unlike the corners of its axis-aligned box
    expect(Math.max(...corners.map(({ y }) => y)) - Math.min(...corners.map(({ y }) => y))).toBeCloseTo(0, 5);
    expect(Math.max(...corners.map(({ x }) => x)) - Math.min(...corners.map(({ x }) => x))).toBeCloseTo(100 * Math.SQRT2, 5);
  });

  it('should turn the world corners of other nodes into the frame of the group', () => {
    // mock
    const rectangle = { height: 10, id: 'r', rotation: 0, type: NodeType.rectangle, width: 10, x: 10, y: 0 } as TRectangleNode;

    // before
    const [first] = getNodeLocalCorners(rectangle, 90);

    // result
    expect(first.x).toBeCloseTo(0, 5);
    expect(first.y).toBeCloseTo(-10, 5);
  });
});
