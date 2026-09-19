// utils
import { getChunkPath } from '../getChunkPath';

describe('getChunkPath', () => {
  it('should join the dot loops and walk the bridges back so they cancel out', () => {
    // action
    const path = getChunkPath([
      { radius: 1, x: 0, y: 0 },
      { radius: 1, x: 10, y: 0 },
      { radius: 1, x: 20, y: 0 },
    ]);

    // result
    expect(path).toHaveLength(7 * 3 + 2);
    expect(path[0]).toEqual({ x: 1, y: 0 });
    expect(path[path.length - 1]).toEqual({ x: 1, y: 0 });
    expect(path[path.length - 2]).toEqual({ x: 11, y: 0 });
  });

  it('should be just the loop for a single dot', () => {
    // result
    expect(getChunkPath([{ radius: 1, x: 0, y: 0 }])).toHaveLength(7);
  });
});
