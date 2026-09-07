// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TNodeAlignment } from 'types/design/types';
import { TPoint } from 'types/canvas';

type TSize = { height: number; width: number };

const axisAnchor = (
  value: AlignmentHorizontal | AlignmentVertical | undefined,
  parentSize: number,
  childSize: number,
): number | undefined => {
  switch (value) {
    case AlignmentHorizontal.left:
    case AlignmentVertical.top:
      return 0;
    case AlignmentHorizontal.center:
    case AlignmentVertical.center:
      return (parentSize - childSize) / 2;
    case AlignmentHorizontal.right:
    case AlignmentVertical.bottom:
      return parentSize - childSize;
    default:
      return undefined;
  }
};

export const getAlignedChildLocalPosition = (
  alignment: TNodeAlignment | undefined,
  parent: TSize,
  child: TSize,
  currentLocal: TPoint,
): TPoint => ({
  x: axisAnchor(alignment?.horizontal, parent.width, child.width) ?? currentLocal.x,
  y: axisAnchor(alignment?.vertical, parent.height, child.height) ?? currentLocal.y,
});
