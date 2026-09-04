// others
import { HORIZONTAL_CROSS_AXIS_ALIGNMENT, VERTICAL_CROSS_AXIS_ALIGNMENT } from '../constants';

// types
import { AlignmentLayout } from 'types/design/enums';
import { CrossAxisAlignment } from '../types';

const MIDDLE_ROW_ALIGNMENTS = [AlignmentLayout.left, AlignmentLayout.center, AlignmentLayout.right];
const MIDDLE_COLUMN_ALIGNMENTS = [AlignmentLayout.topCenter, AlignmentLayout.center, AlignmentLayout.bottomCenter];

const getAxis = (isHorizontal: boolean, isGapAutoVertical: boolean, isGapAutoHorizontal: boolean): string => {
  if (isHorizontal) {
    if (isGapAutoHorizontal) {
      return 'horizontal-auto';
    }

    return 'horizontal';
  }

  if (isGapAutoVertical) {
    return 'vertical-auto';
  }

  return 'vertical';
};

const getCrossAxisModifier = (crossAxis: CrossAxisAlignment): string | undefined => {
  switch (crossAxis) {
    case CrossAxisAlignment.center:
      return 'center';
    case CrossAxisAlignment.end:
      return 'end';
    default:
      return undefined;
  }
};

const isShortIndicator = (alignment: AlignmentLayout, axis: string): boolean => {
  if (axis === 'vertical-auto') {
    return MIDDLE_ROW_ALIGNMENTS.includes(alignment);
  }

  if (axis === 'horizontal-auto') {
    return MIDDLE_COLUMN_ALIGNMENTS.includes(alignment);
  }

  return false;
};

export const getOptionViewModifiers = (
  alignment: AlignmentLayout,
  isHorizontal: boolean,
  isGapAutoVertical: boolean,
  isGapAutoHorizontal: boolean,
): string[] => {
  const axis = getAxis(isHorizontal, isGapAutoVertical, isGapAutoHorizontal);
  const crossAxis = isHorizontal ? HORIZONTAL_CROSS_AXIS_ALIGNMENT[alignment] : VERTICAL_CROSS_AXIS_ALIGNMENT[alignment];
  const crossAxisModifier = getCrossAxisModifier(crossAxis);
  const modifiers = crossAxisModifier ? [axis, crossAxisModifier] : [axis];

  if (isShortIndicator(alignment, axis)) {
    modifiers.push('short');
  }

  return modifiers;
};
