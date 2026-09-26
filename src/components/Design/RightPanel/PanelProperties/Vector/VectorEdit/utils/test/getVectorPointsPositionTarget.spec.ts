// utils
import { getVectorPointsPositionTarget } from '../getVectorPointsPositionTarget';

describe('getVectorPointsPositionTarget', () => {
  it('should return how far the points move for a new value on the canvas', () => {
    // result
    expect(getVectorPointsPositionTarget({ origin: { x: 10, y: 20 }, parent: undefined, x: 10, y: 20 }, 'x', 25)).toEqual({ x: 15, y: 0 });
  });

  it('should read the new value relative to the parent', () => {
    // mock
    const parent = { height: 100, rotation: 0, width: 100, x: 5, y: 5 };

    // result
    expect(getVectorPointsPositionTarget({ origin: { x: 10, y: 20 }, parent, x: 5, y: 15 }, 'y', 0)).toEqual({ x: 0, y: -15 });
  });
});
