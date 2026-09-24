// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

// utils
import { getAlignmentOffset } from '../getAlignmentOffset';

describe('getAlignmentOffset', () => {
  // a 20-wide span starting at 30, inside a 100-wide target starting at 0
  it('should move the start onto the target start for left and top', () => {
    // result
    expect(getAlignmentOffset(AlignmentHorizontal.left, 30, 20, 0, 100)).toBe(-30);
    expect(getAlignmentOffset(AlignmentVertical.top, 30, 20, 0, 100)).toBe(-30);
  });

  it('should move the center onto the target center for both center values', () => {
    // result
    expect(getAlignmentOffset(AlignmentHorizontal.center, 30, 20, 0, 100)).toBe(10);
    expect(getAlignmentOffset(AlignmentVertical.center, 30, 25, 0, 100)).toBe(7.5);
  });

  it('should move the end onto the target end for right and bottom', () => {
    // result
    expect(getAlignmentOffset(AlignmentHorizontal.right, 30, 20, 0, 100)).toBe(50);
    expect(getAlignmentOffset(AlignmentVertical.bottom, 30, 20, 0, 100)).toBe(50);
  });

  it('should not move an axis without an alignment', () => {
    // result
    expect(getAlignmentOffset(undefined, 30, 20, 0, 100)).toBe(0);
  });
});
