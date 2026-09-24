// utils
import { getBooleanNoisePoints } from '../getBooleanNoisePoints';

describe('getBooleanNoisePoints', () => {
  it('should return the four corners of the bounds clockwise from the top left', () => {
    // action / result
    expect(getBooleanNoisePoints({ height: 20, width: 30, x: 5, y: 10 })).toEqual([
      { x: 5, y: 10 },
      { x: 35, y: 10 },
      { x: 35, y: 30 },
      { x: 5, y: 30 },
    ]);
  });
});
