// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

// others
import { isHorizontalTickActive, isVerticalTickActive } from '../constants';

describe('isHorizontalTickActive', () => {
  it('should treat an unset value as left (the default)', () => {
    expect(isHorizontalTickActive(undefined, AlignmentHorizontal.left)).toBe(true);
    expect(isHorizontalTickActive(undefined, AlignmentHorizontal.right)).toBe(false);
  });

  it('should match the explicit value against the requested side', () => {
    expect(isHorizontalTickActive(AlignmentHorizontal.right, AlignmentHorizontal.right)).toBe(true);
    expect(isHorizontalTickActive(AlignmentHorizontal.right, AlignmentHorizontal.left)).toBe(false);
  });

  it('should activate neither side for center', () => {
    expect(isHorizontalTickActive(AlignmentHorizontal.center, AlignmentHorizontal.left)).toBe(false);
    expect(isHorizontalTickActive(AlignmentHorizontal.center, AlignmentHorizontal.right)).toBe(false);
  });
});

describe('isVerticalTickActive', () => {
  it('should treat an unset value as top (the default)', () => {
    expect(isVerticalTickActive(undefined, AlignmentVertical.top)).toBe(true);
    expect(isVerticalTickActive(undefined, AlignmentVertical.bottom)).toBe(false);
  });

  it('should match the explicit value against the requested side', () => {
    expect(isVerticalTickActive(AlignmentVertical.bottom, AlignmentVertical.bottom)).toBe(true);
    expect(isVerticalTickActive(AlignmentVertical.bottom, AlignmentVertical.top)).toBe(false);
  });

  it('should activate neither side for center', () => {
    expect(isVerticalTickActive(AlignmentVertical.center, AlignmentVertical.top)).toBe(false);
    expect(isVerticalTickActive(AlignmentVertical.center, AlignmentVertical.bottom)).toBe(false);
  });
});
