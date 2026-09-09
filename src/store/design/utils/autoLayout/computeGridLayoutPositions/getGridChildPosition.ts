// types
import { AlignmentHorizontal, AlignmentVertical, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAxisAlign } from '../getAlignmentComponents';
import { TDraftRect } from 'types/canvas';

// utils
import { clampAutoLayoutSize } from '../clampAutoLayoutSize';
import { getAxisOffset } from '../getAxisOffset';

const HORIZONTAL_AXIS_ALIGN: Record<AlignmentHorizontal, TAxisAlign> = {
  [AlignmentHorizontal.center]: 'center',
  [AlignmentHorizontal.left]: 'start',
  [AlignmentHorizontal.right]: 'end',
};

const VERTICAL_AXIS_ALIGN: Record<AlignmentVertical, TAxisAlign> = {
  [AlignmentVertical.bottom]: 'end',
  [AlignmentVertical.center]: 'center',
  [AlignmentVertical.top]: 'start',
};

export const getGridChildPosition = (child: TAutoLayoutChildSize, cell: TDraftRect): TAutoLayoutChildPosition => {
  const isWidthFill = child.widthSizingMode === SizingMode.fill;
  const isHeightFill = child.heightSizingMode === SizingMode.fill;
  const width = isWidthFill ? clampAutoLayoutSize(cell.width, child.minWidth, child.maxWidth) : child.width;
  const height = isHeightFill ? clampAutoLayoutSize(cell.height, child.minHeight, child.maxHeight) : child.height;
  const horizontalAlign = HORIZONTAL_AXIS_ALIGN[child.gridChildHorizontalAlign ?? AlignmentHorizontal.left];
  const verticalAlign = VERTICAL_AXIS_ALIGN[child.gridChildVerticalAlign ?? AlignmentVertical.top];
  const x = isWidthFill ? cell.x : cell.x + getAxisOffset(horizontalAlign, cell.width, width);
  const y = isHeightFill ? cell.y : cell.y + getAxisOffset(verticalAlign, cell.height, height);

  return { height, id: child.id, width, x, y };
};
