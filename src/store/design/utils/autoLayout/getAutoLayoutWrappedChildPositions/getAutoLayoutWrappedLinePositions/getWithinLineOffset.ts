// types
import { TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAxisAlign } from '../../getAlignmentComponents';

// utils
import { getAutoLayoutChildBaselineOffset } from '../../getAutoLayoutChildBaselineOffset';
import { getAxisOffset } from '../../getAxisOffset';

export const getWithinLineOffset = (
  alignTextBaseline: boolean,
  maxBaseline: number,
  child: TAutoLayoutChildSize,
  counterAlign: TAxisAlign,
  lineThickness: number,
  counterChildSize: number,
): number =>
  alignTextBaseline ? maxBaseline - getAutoLayoutChildBaselineOffset(child) : getAxisOffset(counterAlign, lineThickness, counterChildSize);
