// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

export const getAxisConstraintDelta = (value: AlignmentHorizontal | AlignmentVertical | undefined, sizeDelta: number): number => {
  switch (value) {
    case AlignmentHorizontal.right:
    case AlignmentVertical.bottom:
      return sizeDelta;
    case AlignmentHorizontal.center:
    case AlignmentVertical.center:
      return sizeDelta / 2;
    default:
      return 0;
  }
};
