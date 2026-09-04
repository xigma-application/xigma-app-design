// others
import { HORIZONTAL_CROSS_AXIS_ALIGNMENT, VERTICAL_CROSS_AXIS_ALIGNMENT } from '../AlignmentOption/constants';

// types
import { AlignmentLayout } from 'types/design/enums';

export const isOptionSelected = (
  alignment: AlignmentLayout,
  value: AlignmentLayout,
  isGapAutoVertical: boolean,
  isGapAutoHorizontal: boolean,
  isHorizontal: boolean,
): boolean => {
  const isGapAuto = isHorizontal ? isGapAutoHorizontal : isGapAutoVertical;

  if (isGapAuto) {
    const crossAxisAlignment = isHorizontal ? HORIZONTAL_CROSS_AXIS_ALIGNMENT : VERTICAL_CROSS_AXIS_ALIGNMENT;
    return crossAxisAlignment[alignment] === crossAxisAlignment[value];
  }

  return alignment === value;
};
