// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

// utils
import { getMirroredConstraint } from '../getMirroredConstraint';

describe('getMirroredConstraint', () => {
  it('should mirror the horizontal constraint for a horizontal flip, defaulting to left', () => {
    // result
    expect(getMirroredConstraint({ horizontal: AlignmentHorizontal.right, vertical: AlignmentVertical.top }, 'horizontal')).toEqual({
      horizontal: AlignmentHorizontal.left,
      vertical: AlignmentVertical.top,
    });
    expect(getMirroredConstraint(undefined, 'horizontal')).toEqual({ horizontal: AlignmentHorizontal.right });
  });

  it('should mirror the vertical constraint for a vertical flip, defaulting to top', () => {
    // result
    expect(getMirroredConstraint({ vertical: AlignmentVertical.bottom }, 'vertical')).toEqual({ vertical: AlignmentVertical.top });
    expect(getMirroredConstraint(undefined, 'vertical')).toEqual({ vertical: AlignmentVertical.bottom });
  });
});
