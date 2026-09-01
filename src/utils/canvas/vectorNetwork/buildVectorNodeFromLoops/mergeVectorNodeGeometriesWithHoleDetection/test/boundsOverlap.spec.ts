// utils
import { boundsOverlap } from '../boundsOverlap';

describe('boundsOverlap', () => {
  it('should return true when two boxes genuinely overlap', () => {
    expect(boundsOverlap([0, 0, 10, 10], [5, 5, 15, 15])).toBe(true);
  });

  it('should return false when boxes are separated on the x axis', () => {
    expect(boundsOverlap([0, 0, 10, 10], [20, 0, 30, 10])).toBe(false);
  });

  it('should return false when boxes are separated on the y axis', () => {
    expect(boundsOverlap([0, 0, 10, 10], [0, 20, 10, 30])).toBe(false);
  });

  it('should return false when boxes only touch at an edge (exclusive bounds)', () => {
    expect(boundsOverlap([0, 0, 10, 10], [10, 0, 20, 10])).toBe(false);
  });
});
