// utils
import { clampToFrameEdge } from '../clampToFrameEdge';

describe('clampToFrameEdge', () => {
  it('should push the value out to the minimum gap when it sits flush with the edge', () => {
    expect(clampToFrameEdge(0, 0)).toBe(2);
  });

  it('should push the value out when it falls short of the minimum gap', () => {
    expect(clampToFrameEdge(1, 0)).toBe(2);
  });

  it('should leave the value untouched once it already clears the minimum gap', () => {
    expect(clampToFrameEdge(10, 0)).toBe(10);
  });

  it('should measure the gap relative to a non-zero edge', () => {
    expect(clampToFrameEdge(100, 100)).toBe(102);
  });
});
