// utils
import { occupyGridRegion } from '../occupyGridRegion';

describe('occupyGridRegion behaviors', () => {
  it('should add every cell of the region to the set', () => {
    // mock
    const occupied = new Set<string>();

    // action
    occupyGridRegion(occupied, 1, 2, 2, 2);

    // result
    expect([...occupied].sort()).toEqual(['1:2', '1:3', '2:2', '2:3']);
  });

  it('should add a single cell for a one-by-one region', () => {
    // mock
    const occupied = new Set<string>();

    // action
    occupyGridRegion(occupied, 0, 0, 1, 1);

    // result
    expect([...occupied]).toEqual(['0:0']);
  });
});
