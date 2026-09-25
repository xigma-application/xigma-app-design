// utils
import { getDiamondArrowEndPoints } from '../getDiamondArrowEndPoints';

describe('getDiamondArrowEndPoints', () => {
  it('should put a filled diamond centered on the line end, joined to the line edges', () => {
    // result
    expect(getDiamondArrowEndPoints(2)).toEqual([
      { x: -6, y: 2 },
      { x: 0, y: 8 },
      { x: 8, y: 0 },
      { x: 0, y: -8 },
      { x: -6, y: -2 },
    ]);
  });
});
