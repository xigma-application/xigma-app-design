// types
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from './getAutoLayoutChildPositions';
import { TAxisAlign } from '../getAlignmentComponents';
import { TDraftRect } from 'types/canvas';

// utils
import { getAutoLayoutChildBaselineOffset } from '../getAutoLayoutChildBaselineOffset';
import { getAxisOffset } from '../getAxisOffset';

export const getAutoLayoutChildPosition = (
  child: TAutoLayoutChildSize,
  isHorizontal: boolean,
  frame: TDraftRect,
  offset: number,
  counterAlign: TAxisAlign,
  counterSize: number,
  alignTextBaseline: boolean,
  maxBaseline: number,
): TAutoLayoutChildPosition => {
  const counterChildSize = isHorizontal ? child.height : child.width;
  const counterOffset = alignTextBaseline
    ? maxBaseline - getAutoLayoutChildBaselineOffset(child)
    : getAxisOffset(counterAlign, counterSize, counterChildSize);

  return isHorizontal
    ? { height: child.height, id: child.id, width: child.width, x: frame.x + offset, y: frame.y + counterOffset }
    : { height: child.height, id: child.id, width: child.width, x: frame.x + counterOffset, y: frame.y + offset };
};
