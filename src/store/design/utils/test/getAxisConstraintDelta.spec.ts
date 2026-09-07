// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

// utils
import { getAxisConstraintDelta } from '../getAxisConstraintDelta';

describe('getAxisConstraintDelta', () => {
  it('should return zero for the default (left/top) constraint', () => {
    expect(getAxisConstraintDelta(undefined, 100)).toBe(0);
    expect(getAxisConstraintDelta(AlignmentHorizontal.left, 100)).toBe(0);
    expect(getAxisConstraintDelta(AlignmentVertical.top, 100)).toBe(0);
  });

  it('should return the full size delta for right/bottom', () => {
    expect(getAxisConstraintDelta(AlignmentHorizontal.right, 100)).toBe(100);
    expect(getAxisConstraintDelta(AlignmentVertical.bottom, -40)).toBe(-40);
  });

  it('should return half the size delta for center', () => {
    expect(getAxisConstraintDelta(AlignmentHorizontal.center, 100)).toBe(50);
    expect(getAxisConstraintDelta(AlignmentVertical.center, 100)).toBe(50);
  });
});
