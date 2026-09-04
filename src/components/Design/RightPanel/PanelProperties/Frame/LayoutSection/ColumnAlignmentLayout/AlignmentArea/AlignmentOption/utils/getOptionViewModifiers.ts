// others
import { HORIZONTAL_CROSS_AXIS_ALIGNMENT, VERTICAL_CROSS_AXIS_ALIGNMENT } from '../constants';

// types
import { AlignmentLayout } from 'types/design/enums';
import { CrossAxisAlignment } from '../types';

export const getOptionViewModifiers = (alignment: AlignmentLayout, isHorizontal: boolean): string[] => {
  const axis = isHorizontal ? 'horizontal' : 'vertical';
  const crossAxis = isHorizontal ? HORIZONTAL_CROSS_AXIS_ALIGNMENT[alignment] : VERTICAL_CROSS_AXIS_ALIGNMENT[alignment];

  switch (crossAxis) {
    case CrossAxisAlignment.center:
      return [axis, 'center'];
    case CrossAxisAlignment.end:
      return [axis, 'end'];
    default:
      return [axis];
  }
};
