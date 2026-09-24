// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

export const getAlignmentOffset = (
  alignment: AlignmentHorizontal | AlignmentVertical | undefined,
  start: number,
  size: number,
  targetStart: number,
  targetSize: number,
): number => {
  switch (alignment) {
    case AlignmentHorizontal.left:
    case AlignmentVertical.top:
      return targetStart - start;
    case AlignmentHorizontal.center:
    case AlignmentVertical.center:
      return targetStart + (targetSize - size) / 2 - start;
    case AlignmentHorizontal.right:
    case AlignmentVertical.bottom:
      return targetStart + targetSize - (start + size);
    default:
      return 0;
  }
};
