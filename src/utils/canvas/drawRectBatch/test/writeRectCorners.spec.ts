// types
import { TRectangleNode } from 'types/design/types';

// utils
import { writeRectCorners } from '../writeRectCorners';

const createNode = (rotation: number): TRectangleNode =>
  ({
    fills: [],
    height: 20,
    id: 'r',
    name: 'r',
    parentId: null,
    rotation,
    type: 'rectangle',
    width: 10,
    x: 5,
    y: 5,
  }) as unknown as TRectangleNode;

describe('writeRectCorners', () => {
  it('should write the four corners of an unrotated rectangle clockwise from the top-left', () => {
    // mock
    const corners = new Float32Array(8);

    // before
    writeRectCorners(createNode(0), corners);

    // result
    expect(Array.from(corners)).toEqual([5, 5, 15, 5, 15, 25, 5, 25]);
  });

  it('should rotate the corners around the rectangle center', () => {
    // mock
    const corners = new Float32Array(8);

    // before
    writeRectCorners(createNode(90), corners);

    // result
    expect(corners[0]).toBeCloseTo(20);
    expect(corners[1]).toBeCloseTo(10);
    expect(corners[4]).toBeCloseTo(0);
  });
});
