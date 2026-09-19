// utils
import { getLoopArea } from '../getLoopArea';

describe('getLoopArea', () => {
  it('should be the polygon area whatever the winding', () => {
    // before
    const square = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
      { x: 0, y: 3 },
    ];

    // result
    expect(getLoopArea(square)).toBe(12);
    expect(getLoopArea([...square].reverse())).toBe(12);
  });
});
