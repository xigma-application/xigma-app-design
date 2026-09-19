// utils
import { getDotChunkPaths } from '../getDotChunkPaths';

describe('getDotChunkPaths', () => {
  it('should split the dots into chunks of 40', () => {
    // before
    const dots = Array.from({ length: 95 }, (_, index) => ({ radius: 1, x: index, y: 0 }));

    // action
    const chunks = getDotChunkPaths(dots);

    // result
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(7 * 40 + 39);
    expect(chunks[2]).toHaveLength(7 * 15 + 14);
  });

  it('should return nothing without dots', () => {
    // result
    expect(getDotChunkPaths([])).toEqual([]);
  });
});
