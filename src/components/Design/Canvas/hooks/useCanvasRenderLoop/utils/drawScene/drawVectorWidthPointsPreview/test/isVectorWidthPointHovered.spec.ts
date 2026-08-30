// utils
import { isVectorWidthPointHovered } from '../isVectorWidthPointHovered';

describe('isVectorWidthPointHovered', () => {
  it('should be false when nothing is hovered', () => {
    // result
    expect(isVectorWidthPointHovered(null, 'node-1', 's1', 0.5)).toBe(false);
  });

  it('should be true when node, segment and t all match', () => {
    // result
    expect(isVectorWidthPointHovered({ nodeId: 'node-1', segmentId: 's1', t: 0.5 }, 'node-1', 's1', 0.5)).toBe(true);
  });

  it('should be false when the node differs', () => {
    // result
    expect(isVectorWidthPointHovered({ nodeId: 'node-2', segmentId: 's1', t: 0.5 }, 'node-1', 's1', 0.5)).toBe(false);
  });

  it('should be false when the segment differs', () => {
    // result
    expect(isVectorWidthPointHovered({ nodeId: 'node-1', segmentId: 's2', t: 0.5 }, 'node-1', 's1', 0.5)).toBe(false);
  });

  it('should be false when t differs', () => {
    // result
    expect(isVectorWidthPointHovered({ nodeId: 'node-1', segmentId: 's1', t: 0.4 }, 'node-1', 's1', 0.5)).toBe(false);
  });
});
