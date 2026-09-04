import { useState } from 'react';

// others
import { HORIZONTAL_CROSS_AXIS_ALIGNMENT, VERTICAL_CROSS_AXIS_ALIGNMENT } from '../AlignmentOption/constants';

// types
import { AlignmentLayout } from 'types/design/enums';
import { CrossAxisAlignment } from '../AlignmentOption/types';

export type TUseColumnHoverResult = {
  isColumnHighlighted: TFunc<[AlignmentLayout], boolean>;
  onMouseEnterOption: TFunc<[AlignmentLayout]>;
  onMouseLeaveOption: TFunc;
};

export const useColumnHover = (isGapAutoVertical: boolean, isGapAutoHorizontal: boolean, isHorizontal: boolean): TUseColumnHoverResult => {
  const [hoveredGroup, setHoveredGroup] = useState<CrossAxisAlignment | null>(null);
  const isGapAuto = isHorizontal ? isGapAutoHorizontal : isGapAutoVertical;
  const crossAxisAlignment = isHorizontal ? HORIZONTAL_CROSS_AXIS_ALIGNMENT : VERTICAL_CROSS_AXIS_ALIGNMENT;

  return {
    isColumnHighlighted: (alignment) => isGapAuto && crossAxisAlignment[alignment] === hoveredGroup,
    onMouseEnterOption: (alignment): void => {
      if (isGapAuto) {
        setHoveredGroup(crossAxisAlignment[alignment]);
      }
    },
    onMouseLeaveOption: () => setHoveredGroup(null),
  };
};
